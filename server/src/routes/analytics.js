const express = require("express");
const prisma = require("../db");
const auth = require("../middleware/auth");
const { build1RMHistory } = require("../services/estimator");
const { predictExerciseProgress } = require("../services/predictionService");
const { calculateAdherence, calculateTrainingTrend } = require("../services/trainingLoad");

const router = express.Router();

// GET /api/analytics/e1rm/:exerciseId — historical 1RM trend for an exercise
router.get("/e1rm/:exerciseId", auth, async (req, res) => {
  try {
    const exerciseId = parseInt(req.params.exerciseId, 10);

    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      return res.status(404).json({ success: false, error: "Exercise not found." });
    }

    const logs = await prisma.performanceLog.findMany({
      where: { exerciseId, userId: req.user.id },
      orderBy: { date: "asc" },
    });

    const history = build1RMHistory(logs);

    return res.status(200).json({
      success: true,
      data: {
        exercise,
        history,
        current1RM: history.length > 0 ? history[history.length - 1].e1rm : null,
      },
    });
  } catch (error) {
    console.error("Get 1RM analytics error:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch 1RM analytics." });
  }
});

// GET /api/analytics/prediction/:goalId — statistical forecast for a goal
router.get("/prediction/:goalId", auth, async (req, res) => {
  try {
    const goalId = parseInt(req.params.goalId, 10);

    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId: req.user.id },
      include: { exercise: true },
    });

    if (!goal) {
      return res.status(404).json({ success: false, error: "Goal not found." });
    }

    // Fetch all logs for this goal's exercise
    const logs = await prisma.performanceLog.findMany({
      where: { exerciseId: goal.exerciseId, userId: req.user.id },
      orderBy: { date: "asc" },
    });

    const prediction = predictExerciseProgress(logs, goal.targetWeight, 12);

    return res.status(200).json({
      success: true,
      data: {
        goal,
        prediction,
      },
    });
  } catch (error) {
    console.error("Get prediction error:", error);
    return res.status(500).json({ success: false, error: "Failed to generate prediction forecast." });
  }
});

// GET /api/analytics/volume-trends — weekly training volume history
router.get("/volume-trends", auth, async (req, res) => {
  try {
    const logs = await prisma.performanceLog.findMany({
      where: { userId: req.user.id },
      orderBy: { date: "asc" },
    });

    // Group logs into weekly bins (Sunday-based or 7-day increments)
    const weeklyMap = {};

    logs.forEach((log) => {
      const d = new Date(log.date);
      // Start of week date string
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff)).toISOString().split("T")[0];

      const vol = (parseFloat(log.weight) || 0) * (parseInt(log.repetitions, 10) || 0);
      weeklyMap[monday] = (weeklyMap[monday] || 0) + vol;
    });

    const volumeData = Object.entries(weeklyMap).map(([week, volume]) => ({
      week,
      volume: Math.round(volume),
    }));

    return res.status(200).json({
      success: true,
      data: { volumeData },
    });
  } catch (error) {
    console.error("Get volume trends error:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch volume trends." });
  }
});

module.exports = router;
