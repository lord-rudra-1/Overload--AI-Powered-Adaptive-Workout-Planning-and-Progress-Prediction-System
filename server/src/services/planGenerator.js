/**
 * Workout Plan Generator Service
 * 
 * Generates structured workout splits and exercise prescriptions based on:
 * - Available weekly training days (2-6 days)
 * - Athlete experience level (beginner, intermediate, advanced)
 * - Available equipment (full_gym, home, bodyweight)
 * - Athlete body weight (used to scale initial baseline targets)
 */

const prisma = require("../db");

/**
 * Baseline bodyweight multipliers for initial prescription when no history exists
 */
const BASELINE_MULTIPLIERS = {
  beginner: {
    chest_compound: 0.5,
    legs_squat: 0.6,
    back_hinge: 0.7,
    back_pull: 0.45,
    shoulders_compound: 0.35,
    isolation: 0.15,
  },
  intermediate: {
    chest_compound: 0.75,
    legs_squat: 1.0,
    back_hinge: 1.15,
    back_pull: 0.65,
    shoulders_compound: 0.5,
    isolation: 0.2,
  },
  advanced: {
    chest_compound: 1.0,
    legs_squat: 1.3,
    back_hinge: 1.5,
    back_pull: 0.85,
    shoulders_compound: 0.65,
    isolation: 0.25,
  },
};

/**
 * Calculates a sensible starting weight for an exercise
 */
function estimateStartingWeight(exercise, userProfile) {
  const bodyWeight = parseFloat(userProfile.bodyWeight) || 70;
  const experience = (userProfile.experience || "beginner").toLowerCase();
  const increment = parseFloat(userProfile.increment) || 2.5;
  const multipliers = BASELINE_MULTIPLIERS[experience] || BASELINE_MULTIPLIERS.beginner;

  if (exercise.equipment === "bodyweight") {
    return 0; // Calisthenics
  }

  let ratio = multipliers.isolation;
  if (exercise.category === "compound") {
    if (exercise.muscleGroup === "chest") ratio = multipliers.chest_compound;
    else if (exercise.muscleGroup === "legs") ratio = multipliers.legs_squat;
    else if (exercise.movementType === "hinge") ratio = multipliers.back_hinge;
    else if (exercise.muscleGroup === "back") ratio = multipliers.back_pull;
    else if (exercise.muscleGroup === "shoulders") ratio = multipliers.shoulders_compound;
  }

  const rawWeight = bodyWeight * ratio;
  // Round to nearest plate increment
  const rounded = Math.max(increment, Math.round(rawWeight / increment) * increment);
  return rounded;
}

/**
 * Generates an initial or periodic weekly workout schedule for a user
 * 
 * @param {number} userId 
 * @returns {Promise<Array<Object>>} created workouts with exercises
 */
async function generateWeeklyPlan(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { goals: { where: { status: "ACTIVE" }, include: { exercise: true } } },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const trainingDays = Math.min(6, Math.max(2, user.trainingDays || 3));
  const experience = (user.experience || "beginner").toLowerCase();

  // Prescribed volume parameters based on experience
  let targetSets = 3;
  let targetReps = 10;
  let targetRPE = 7.5;

  if (experience === "intermediate") {
    targetSets = 4;
    targetReps = 8;
    targetRPE = 8.0;
  } else if (experience === "advanced") {
    targetSets = 4;
    targetReps = 6;
    targetRPE = 8.5;
  }

  // Fetch available exercises matching equipment
  const equipmentFilter =
    user.equipment === "bodyweight"
      ? { equipment: "bodyweight" }
      : user.equipment === "home"
      ? { equipment: { in: ["barbell", "dumbbell", "bodyweight"] } }
      : {}; // full_gym accepts all

  const availableExercises = await prisma.exercise.findMany({
    where: equipmentFilter,
  });

  if (availableExercises.length === 0) {
    throw new Error("No exercises found for user's equipment profile.");
  }

  // Helper to pick exercises by criteria
  const findEx = (mg, movement, fallbackName) => {
    let match = availableExercises.find(
      (e) => e.muscleGroup === mg && (movement ? e.movementType === movement : true)
    );
    if (!match && fallbackName) {
      match = availableExercises.find((e) => e.name.toLowerCase().includes(fallbackName.toLowerCase()));
    }
    return match || availableExercises[0];
  };

  // Define split layouts based on trainingDays
  let dayTemplates = [];

  if (trainingDays <= 3) {
    // FULL BODY SPLIT (2 or 3 days)
    dayTemplates = [
      {
        dayNum: 1,
        title: "Full Body A",
        exercises: [
          findEx("legs", "squat", "Squat"),
          findEx("chest", "push", "Bench Press"),
          findEx("back", "pull", "Row"),
          findEx("shoulders", "push", "Press"),
          findEx("core", null, "Plank"),
        ],
      },
      {
        dayNum: 2,
        title: "Full Body B",
        exercises: [
          findEx("legs", "hinge", "Deadlift"),
          findEx("back", "pull", "Lat Pulldown"),
          findEx("chest", "push", "Incline"),
          findEx("arms", "pull", "Curl"),
          findEx("arms", "push", "Pushdown"),
        ],
      },
    ];

    if (trainingDays === 3) {
      dayTemplates.push({
        dayNum: 3,
        title: "Full Body C",
        exercises: [
          findEx("legs", "squat", "Leg Press"),
          findEx("chest", "push", "Dumbbell Press"),
          findEx("back", "pull", "Cable Row"),
          findEx("shoulders", "push", "Lateral Raise"),
          findEx("core", null, "Leg Raise"),
        ],
      });
    }
  } else if (trainingDays === 4) {
    // UPPER / LOWER SPLIT
    dayTemplates = [
      {
        dayNum: 1,
        title: "Upper Body A",
        exercises: [
          findEx("chest", "push", "Bench Press"),
          findEx("back", "pull", "Barbell Row"),
          findEx("shoulders", "push", "Overhead Press"),
          findEx("arms", "pull", "Curl"),
          findEx("arms", "push", "Dip"),
        ],
      },
      {
        dayNum: 2,
        title: "Lower Body A",
        exercises: [
          findEx("legs", "squat", "Squat"),
          findEx("legs", "hinge", "Romanian Deadlift"),
          findEx("legs", "squat", "Bulgarian Split Squat"),
          findEx("legs", "push", "Calf Raise"),
          findEx("core", null, "Plank"),
        ],
      },
      {
        dayNum: 3,
        title: "Upper Body B",
        exercises: [
          findEx("chest", "push", "Incline Dumbbell Press"),
          findEx("back", "pull", "Pull-Up"),
          findEx("shoulders", "push", "Lateral Raise"),
          findEx("back", "isolation", "Face Pull"),
          findEx("arms", "push", "Skull Crusher"),
        ],
      },
      {
        dayNum: 4,
        title: "Lower Body B",
        exercises: [
          findEx("legs", "hinge", "Deadlift"),
          findEx("legs", "squat", "Leg Press"),
          findEx("legs", "pull", "Leg Curl"),
          findEx("legs", "hinge", "Hip Thrust"),
          findEx("core", null, "Hanging Leg Raise"),
        ],
      },
    ];
  } else {
    // PUSH / PULL / LEGS SPLIT (5 or 6 days)
    dayTemplates = [
      {
        dayNum: 1,
        title: "Push A",
        exercises: [
          findEx("chest", "push", "Bench Press"),
          findEx("shoulders", "push", "Overhead Press"),
          findEx("chest", "push", "Dumbbell Fly"),
          findEx("shoulders", "push", "Lateral Raise"),
          findEx("arms", "push", "Tricep Pushdown"),
        ],
      },
      {
        dayNum: 2,
        title: "Pull A",
        exercises: [
          findEx("back", "hinge", "Deadlift"),
          findEx("back", "pull", "Barbell Row"),
          findEx("back", "pull", "Lat Pulldown"),
          findEx("back", "isolation", "Face Pull"),
          findEx("arms", "pull", "Barbell Curl"),
        ],
      },
      {
        dayNum: 3,
        title: "Legs A",
        exercises: [
          findEx("legs", "squat", "Squat"),
          findEx("legs", "hinge", "Romanian Deadlift"),
          findEx("legs", "squat", "Leg Press"),
          findEx("legs", "pull", "Leg Curl"),
          findEx("core", null, "Plank"),
        ],
      },
      {
        dayNum: 4,
        title: "Push B",
        exercises: [
          findEx("chest", "push", "Incline Barbell Bench Press"),
          findEx("shoulders", "push", "Dumbbell Shoulder Press"),
          findEx("chest", "push", "Push-Up"),
          findEx("shoulders", "push", "Cable Lateral Raise"),
          findEx("arms", "push", "Dip"),
        ],
      },
      {
        dayNum: 5,
        title: "Pull B",
        exercises: [
          findEx("back", "pull", "Pull-Up"),
          findEx("back", "pull", "Seated Cable Row"),
          findEx("back", "pull", "Dumbbell Row"),
          findEx("arms", "pull", "Hammer Curl"),
          findEx("core", null, "Ab Rollout"),
        ],
      },
    ];

    if (trainingDays === 6) {
      dayTemplates.push({
        dayNum: 6,
        title: "Legs B",
        exercises: [
          findEx("legs", "hinge", "Barbell Hip Thrust"),
          findEx("legs", "squat", "Front Squat"),
          findEx("legs", "squat", "Walking Lunge"),
          findEx("legs", "push", "Leg Extension"),
          findEx("legs", "push", "Calf Raise"),
        ],
      });
    }
  }

  // Create the workouts in the database
  const createdWorkouts = [];

  for (let i = 0; i < dayTemplates.length; i++) {
    const template = dayTemplates[i];

    // Schedule dates across the coming week
    const workoutDate = new Date();
    workoutDate.setDate(workoutDate.getDate() + i * 2);

    const workout = await prisma.workout.create({
      data: {
        userId: user.id,
        weekNum: 1,
        dayNum: template.dayNum,
        date: workoutDate,
        status: "PLANNED",
        notes: template.title,
        exercises: {
          create: template.exercises.map((ex, orderIdx) => {
            const targetWeight = estimateStartingWeight(ex, user);
            return {
              exerciseId: ex.id,
              order: orderIdx,
              targetWeight,
              targetReps,
              targetSets,
              targetRPE,
            };
          }),
        },
      },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { order: "asc" },
        },
      },
    });

    createdWorkouts.push(workout);
  }

  return createdWorkouts;
}

module.exports = {
  estimateStartingWeight,
  generateWeeklyPlan,
};
