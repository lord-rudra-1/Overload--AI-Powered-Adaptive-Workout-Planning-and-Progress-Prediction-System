const express = require("express");
const prisma = require("../db");

const router = express.Router();

// GET /api/exercises — list exercises with optional filters
router.get("/", async (req, res) => {
  try {
    const { muscleGroup, equipment, category, search } = req.query;

    const where = {};

    if (muscleGroup) {
      where.muscleGroup = {
        equals: muscleGroup,
        mode: "insensitive",
      };
    }

    if (equipment) {
      where.equipment = {
        equals: equipment,
        mode: "insensitive",
      };
    }

    if (category) {
      where.category = {
        equals: category,
        mode: "insensitive",
      };
    }

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return res.status(200).json({
      success: true,
      data: { exercises },
    });
  } catch (error) {
    console.error("Get exercises error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error.",
    });
  }
});

// GET /api/exercises/:id — get single exercise by ID
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid exercise ID.",
      });
    }

    const exercise = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      return res.status(404).json({
        success: false,
        error: "Exercise not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: { exercise },
    });
  } catch (error) {
    console.error("Get exercise error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error.",
    });
  }
});

module.exports = router;
