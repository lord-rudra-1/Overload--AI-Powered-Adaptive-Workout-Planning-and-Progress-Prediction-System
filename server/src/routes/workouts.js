const express = require("express");
const prisma = require("../db");
const auth = require("../middleware/auth");
const { generateWeeklyPlan } = require("../services/planGenerator");
const { adaptExercisePrescription } = require("../services/adaptationEngine");
const { enforceSafetyConstraints } = require("../services/safetyLayer");
const { calculateAdherence, calculateRpeTrend, calculateSessionMetrics } = require("../services/trainingLoad");

const router = express.Router();

// POST /api/workouts/generate — generate new weekly plan
router.post("/generate", auth, async (req, res) => {
  try {
    const workouts = await generateWeeklyPlan(req.user.id);
    return res.status(201).json({
      success: true,
      data: { workouts, message: "Weekly workout schedule generated successfully." },
    });
  } catch (error) {
    console.error("Generate plan error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to generate workout plan.",
    });
  }
});

// GET /api/workouts — list workouts for user
router.get("/", auth, async (req, res) => {
  try {
    const { status, limit } = req.query;
    const where = { userId: req.user.id };
    if (status) where.status = status;

    const workouts = await prisma.workout.findMany({
      where,
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { date: "desc" },
      take: limit ? parseInt(limit, 10) : undefined,
    });

    return res.status(200).json({
      success: true,
      data: { workouts },
    });
  } catch (error) {
    console.error("List workouts error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch workouts.",
    });
  }
});

// GET /api/workouts/:id — get workout details with exercise logs
router.get("/:id", auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const workout = await prisma.workout.findFirst({
      where: { id, userId: req.user.id },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        error: "Workout not found.",
      });
    }

    // Also fetch any performance logs recorded for this workout
    const performanceLogs = await prisma.performanceLog.findMany({
      where: { workoutId: id, userId: req.user.id },
      include: { exercise: true },
      orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }],
    });

    return res.status(200).json({
      success: true,
      data: { workout, performanceLogs },
    });
  } catch (error) {
    console.error("Get workout error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve workout details.",
    });
  }
});

// PUT /api/workouts/:id/start — mark workout in progress
router.put("/:id/start", auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const workout = await prisma.workout.updateMany({
      where: { id, userId: req.user.id },
      data: { status: "IN_PROGRESS" },
    });

    if (workout.count === 0) {
      return res.status(404).json({
        success: false,
        error: "Workout not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: { status: "IN_PROGRESS" },
    });
  } catch (error) {
    console.error("Start workout error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to start workout.",
    });
  }
});

// PUT /api/workouts/:id/complete — mark workout complete and execute adaptation loop
router.put("/:id/complete", auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { duration, notes } = req.body;

    const workout = await prisma.workout.findFirst({
      where: { id, userId: req.user.id },
      include: {
        exercises: {
          include: { exercise: true },
        },
      },
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        error: "Workout not found.",
      });
    }

    // 1. Mark current workout as completed
    await prisma.workout.update({
      where: { id },
      data: {
        status: "COMPLETED",
        duration: duration ? parseInt(duration, 10) : undefined,
        notes: notes !== undefined ? notes : workout.notes,
      },
    });

    // 2. Fetch logged sets for this workout
    const performedSets = await prisma.performanceLog.findMany({
      where: { workoutId: id, userId: req.user.id },
    });

    // 3. Fetch user profile & recent training history to feed adaptation engine
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    const recentWorkouts = await prisma.workout.findMany({
      where: { userId: req.user.id },
      take: 20,
      orderBy: { date: "desc" },
    });

    const adherence = calculateAdherence(recentWorkouts, user.trainingDays || 3, 4);

    // Group logs to compute RPE trend
    const recentLogs = await prisma.performanceLog.findMany({
      where: { userId: req.user.id },
      take: 60,
      orderBy: { date: "desc" },
    });
    const sessionRpes = [];
    if (recentLogs.length > 0) {
      const avg = recentLogs.reduce((s, l) => s + (l.rpe || 8), 0) / recentLogs.length;
      sessionRpes.push({ avgRpe: avg });
    }
    const rpeTrend = calculateRpeTrend(sessionRpes);

    // 4. Adapt each exercise prescription for future planned workouts
    const adaptationSummaries = [];

    // Find the next upcoming PLANNED workout
    const nextWorkout = await prisma.workout.findFirst({
      where: {
        userId: req.user.id,
        status: "PLANNED",
        id: { not: id },
      },
      include: { exercises: { include: { exercise: true } } },
      orderBy: { date: "asc" },
    });

    if (nextWorkout) {
      for (const currentPrescription of workout.exercises) {
        const exerciseSets = performedSets.filter(
          (s) => s.exerciseId === currentPrescription.exerciseId
        );

        // Find if this exercise (or same muscle group) is present in the next workout
        const matchingTarget = nextWorkout.exercises.find(
          (ne) => ne.exerciseId === currentPrescription.exerciseId
        );

        if (matchingTarget) {
          const adapted = adaptExercisePrescription({
            exercise: currentPrescription.exercise,
            lastPrescription: currentPrescription,
            performedSets: exerciseSets,
            userProfile: user,
            metrics: { adherence, rpeTrend },
          });

          // Pass through safety layer constraint validator
          const safetyCheck = enforceSafetyConstraints(adapted, currentPrescription, user);
          const finalPrescription = safetyCheck.safePrescription;

          // Update next workout exercise with safely constrained adapted values
          await prisma.workoutExercise.update({
            where: { id: matchingTarget.id },
            data: {
              targetWeight: finalPrescription.weight,
              targetReps: finalPrescription.reps,
              targetSets: finalPrescription.sets,
              targetRPE: finalPrescription.rpe,
            },
          });

          adaptationSummaries.push({
            exerciseName: currentPrescription.exercise.name,
            previous: {
              weight: currentPrescription.targetWeight,
              reps: currentPrescription.targetReps,
              sets: currentPrescription.targetSets,
            },
            next: {
              weight: finalPrescription.weight,
              reps: finalPrescription.reps,
              sets: finalPrescription.sets,
            },
            reasoning: finalPrescription.reasoning,
            rule: finalPrescription.ruleApplied,
            safetyAdjustments: safetyCheck.adjustments,
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        message: "Workout completed and next prescriptions adapted.",
        adaptationSummaries,
        adherence,
      },
    });
  } catch (error) {
    console.error("Complete workout error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to complete workout.",
    });
  }
});

// PUT /api/workouts/:id/skip — mark workout skipped
router.put("/:id/skip", auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const workout = await prisma.workout.updateMany({
      where: { id, userId: req.user.id },
      data: { status: "SKIPPED" },
    });

    if (workout.count === 0) {
      return res.status(404).json({
        success: false,
        error: "Workout not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: { status: "SKIPPED", message: "Workout marked as skipped." },
    });
  } catch (error) {
    console.error("Skip workout error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to skip workout.",
    });
  }
});

// PUT /api/workouts/exercise/:id/swap — swap an exercise in a planned workout
router.put("/exercise/:id/swap", auth, async (req, res) => {
  try {
    const workoutExerciseId = parseInt(req.params.id, 10);
    const { newExerciseId } = req.body;

    if (!newExerciseId) {
      return res.status(400).json({ success: false, error: "newExerciseId is required." });
    }

    const currentWorkoutExercise = await prisma.workoutExercise.findUnique({
      where: { id: workoutExerciseId },
      include: {
        workout: true,
        exercise: true,
      },
    });

    if (!currentWorkoutExercise || currentWorkoutExercise.workout.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: "Workout exercise not found." });
    }

    if (currentWorkoutExercise.workout.status === "COMPLETED") {
      return res.status(400).json({ success: false, error: "Cannot modify completed workouts." });
    }

    const newExercise = await prisma.exercise.findUnique({
      where: { id: parseInt(newExerciseId, 10) },
    });

    if (!newExercise) {
      return res.status(404).json({ success: false, error: "Selected replacement exercise not found." });
    }

    const updated = await prisma.workoutExercise.update({
      where: { id: workoutExerciseId },
      data: {
        exerciseId: newExercise.id,
      },
      include: {
        exercise: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: { workoutExercise: updated, message: `Swapped to ${newExercise.name}.` },
    });
  } catch (error) {
    console.error("Exercise swap error:", error);
    return res.status(500).json({ success: false, error: "Failed to swap exercise." });
  }
});

// DELETE /api/workouts/:id — delete a scheduled workout
router.delete("/:id", auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const workout = await prisma.workout.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        error: "Workout not found.",
      });
    }

    // Delete any performance logs for this workout
    await prisma.performanceLog.deleteMany({
      where: { workoutId: id },
    });

    // Delete workout exercises
    await prisma.workoutExercise.deleteMany({
      where: { workoutId: id },
    });

    // Delete workout
    await prisma.workout.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      data: { message: "Scheduled workout deleted successfully." },
    });
  } catch (error) {
    console.error("Delete workout error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete workout.",
    });
  }
});

module.exports = router;
