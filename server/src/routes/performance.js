const express = require("express");
const prisma = require("../db");
const auth = require("../middleware/auth");
const {
  calculateVolumeLoad,
  calculateSessionMetrics,
  calculateAdherence,
  calculateTrainingTrend,
  calculateRpeTrend,
} = require("../services/trainingLoad");

const router = express.Router();

// POST /api/performance/log — record a single completed set
router.post("/log", auth, async (req, res) => {
  try {
    const { exerciseId, workoutId, setNumber, weight, repetitions, rpe, notes } = req.body;

    if (!exerciseId || weight === undefined || repetitions === undefined) {
      return res.status(400).json({
        success: false,
        error: "exerciseId, weight, and repetitions are required.",
      });
    }

    const parsedWeight = parseFloat(weight);
    const parsedReps = parseInt(repetitions, 10);
    const parsedRpe = rpe ? parseFloat(rpe) : null;
    const computedRir = parsedRpe ? Math.max(0, 10 - parsedRpe) : null;

    const log = await prisma.performanceLog.create({
      data: {
        userId: req.user.id,
        exerciseId: parseInt(exerciseId, 10),
        workoutId: workoutId ? parseInt(workoutId, 10) : null,
        setNumber: setNumber ? parseInt(setNumber, 10) : 1,
        weight: parsedWeight,
        repetitions: parsedReps,
        rpe: parsedRpe,
        rir: computedRir,
        notes: notes || null,
      },
      include: {
        exercise: true,
      },
    });

    return res.status(201).json({
      success: true,
      data: { log },
    });
  } catch (error) {
    console.error("Log performance error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to record set performance.",
    });
  }
});

// GET /api/performance/workout/:workoutId — get all sets logged for a workout
router.get("/workout/:workoutId", auth, async (req, res) => {
  try {
    const workoutId = parseInt(req.params.workoutId, 10);
    const logs = await prisma.performanceLog.findMany({
      where: { workoutId, userId: req.user.id },
      include: { exercise: true },
      orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }],
    });

    const metrics = calculateSessionMetrics(logs);

    return res.status(200).json({
      success: true,
      data: { logs, metrics },
    });
  } catch (error) {
    console.error("Get workout logs error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch performance logs for workout.",
    });
  }
});

// GET /api/performance/exercise/:exerciseId — get performance history for an exercise
router.get("/exercise/:exerciseId", auth, async (req, res) => {
  try {
    const exerciseId = parseInt(req.params.exerciseId, 10);
    const logs = await prisma.performanceLog.findMany({
      where: { exerciseId, userId: req.user.id },
      orderBy: { date: "asc" },
    });

    return res.status(200).json({
      success: true,
      data: { logs },
    });
  } catch (error) {
    console.error("Get exercise history error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch exercise history.",
    });
  }
});

// GET /api/performance/summary — calculate holistic training metrics
router.get("/summary", auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    const allWorkouts = await prisma.workout.findMany({
      where: { userId: req.user.id },
      orderBy: { date: "desc" },
    });

    const allLogs = await prisma.performanceLog.findMany({
      where: { userId: req.user.id },
      orderBy: { date: "desc" },
    });

    const adherence = calculateAdherence(allWorkouts, user?.trainingDays || 3, 4);

    // Group logs by workout/date for training trend
    const dailyVolumeMap = {};
    allLogs.forEach((l) => {
      const dayKey = l.date.toISOString().split("T")[0];
      const vol = (parseFloat(l.weight) || 0) * (parseInt(l.repetitions, 10) || 0);
      dailyVolumeMap[dayKey] = (dailyVolumeMap[dayKey] || 0) + vol;
    });

    const sessionVolumes = Object.entries(dailyVolumeMap).map(([date, volume]) => ({
      date,
      volume,
    }));

    const trend = calculateTrainingTrend(sessionVolumes);
    const totalVolume = calculateVolumeLoad(allLogs);

    // Compute recent RPE trend
    const recentLogs = allLogs.slice(0, 30);
    const avgRpe =
      recentLogs.filter((l) => l.rpe).length > 0
        ? recentLogs.reduce((sum, l) => sum + (l.rpe || 0), 0) /
          recentLogs.filter((l) => l.rpe).length
        : null;

    return res.status(200).json({
      success: true,
      data: {
        totalVolume: Math.round(totalVolume),
        totalWorkoutsCompleted: allWorkouts.filter((w) => w.status === "COMPLETED").length,
        adherenceRate: adherence,
        trainingTrend: trend,
        averageRpe: avgRpe ? Math.round(avgRpe * 10) / 10 : null,
      },
    });
  } catch (error) {
    console.error("Get summary error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to calculate training summary.",
    });
  }
});

// DELETE /api/performance/:id — delete a log entry
router.delete("/:id", auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.performanceLog.deleteMany({
      where: { id, userId: req.user.id },
    });

    return res.status(200).json({
      success: true,
      data: { message: "Log removed." },
    });
  } catch (error) {
    console.error("Delete log error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete log entry.",
    });
  }
});

module.exports = router;
