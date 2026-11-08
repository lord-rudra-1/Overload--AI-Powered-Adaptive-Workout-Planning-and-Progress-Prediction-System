const express = require("express");
const prisma = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();

// PUT /api/profile — update user profile fields
router.put("/", auth, async (req, res) => {
  try {
    const { age, gender, bodyWeight, experience, trainingDays, equipment, increment } = req.body;

    // Build update data object with only provided fields
    const updateData = {};
    if (age !== undefined) updateData.age = parseInt(age, 10);
    if (gender !== undefined) updateData.gender = gender;
    if (bodyWeight !== undefined) updateData.bodyWeight = parseFloat(bodyWeight);
    if (experience !== undefined) updateData.experience = experience;
    if (trainingDays !== undefined) updateData.trainingDays = parseInt(trainingDays, 10);
    if (equipment !== undefined) updateData.equipment = equipment;
    if (increment !== undefined) updateData.increment = parseFloat(increment);

    // Validate numeric fields
    if (updateData.age !== undefined && (isNaN(updateData.age) || updateData.age < 1)) {
      return res.status(400).json({
        success: false,
        error: "Age must be a positive integer.",
      });
    }

    if (updateData.bodyWeight !== undefined && (isNaN(updateData.bodyWeight) || updateData.bodyWeight <= 0)) {
      return res.status(400).json({
        success: false,
        error: "Body weight must be a positive number.",
      });
    }

    if (updateData.trainingDays !== undefined && (isNaN(updateData.trainingDays) || updateData.trainingDays < 1 || updateData.trainingDays > 7)) {
      return res.status(400).json({
        success: false,
        error: "Training days must be between 1 and 7.",
      });
    }

    if (updateData.increment !== undefined && (isNaN(updateData.increment) || updateData.increment <= 0)) {
      return res.status(400).json({
        success: false,
        error: "Increment must be a positive number.",
      });
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        gender: true,
        bodyWeight: true,
        experience: true,
        trainingDays: true,
        equipment: true,
        increment: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error.",
    });
  }
});

// POST /api/profile/goal — create a new goal
router.post("/goal", auth, async (req, res) => {
  try {
    const { exerciseId, targetWeight, targetDate } = req.body;

    // Validate required fields
    if (!exerciseId || targetWeight === undefined) {
      return res.status(400).json({
        success: false,
        error: "exerciseId and targetWeight are required.",
      });
    }

    const parsedWeight = parseFloat(targetWeight);
    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      return res.status(400).json({
        success: false,
        error: "targetWeight must be a positive number.",
      });
    }

    // Check exercise exists
    const exercise = await prisma.exercise.findUnique({
      where: { id: parseInt(exerciseId, 10) },
    });

    if (!exercise) {
      return res.status(404).json({
        success: false,
        error: "Exercise not found.",
      });
    }

    const goalData = {
      userId: req.user.id,
      exerciseId: parseInt(exerciseId, 10),
      targetWeight: parsedWeight,
    };

    if (targetDate) {
      goalData.targetDate = new Date(targetDate);
    }

    const goal = await prisma.goal.create({
      data: goalData,
      include: {
        exercise: true,
      },
    });

    return res.status(201).json({
      success: true,
      data: { goal },
    });
  } catch (error) {
    console.error("Create goal error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error.",
    });
  }
});

// GET /api/profile/goals — list user's goals with exercise details
router.get("/goals", auth, async (req, res) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.user.id },
      include: {
        exercise: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: { goals },
    });
  } catch (error) {
    console.error("Get goals error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error.",
    });
  }
});

module.exports = router;
