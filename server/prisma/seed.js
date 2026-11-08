const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const exercises = [
  // ── Chest ──────────────────────────────────────────────────────────
  { name: "Barbell Bench Press",         muscleGroup: "chest",     category: "compound",  equipment: "barbell",    movementType: "push" },
  { name: "Incline Barbell Bench Press", muscleGroup: "chest",     category: "compound",  equipment: "barbell",    movementType: "push" },
  { name: "Dumbbell Bench Press",        muscleGroup: "chest",     category: "compound",  equipment: "dumbbell",   movementType: "push" },
  { name: "Incline Dumbbell Press",      muscleGroup: "chest",     category: "compound",  equipment: "dumbbell",   movementType: "push" },
  { name: "Dumbbell Fly",               muscleGroup: "chest",     category: "isolation",  equipment: "dumbbell",   movementType: "push" },
  { name: "Cable Crossover",            muscleGroup: "chest",     category: "isolation",  equipment: "cable",      movementType: "push" },
  { name: "Machine Chest Press",        muscleGroup: "chest",     category: "compound",  equipment: "machine",    movementType: "push" },
  { name: "Push-Up",                    muscleGroup: "chest",     category: "compound",  equipment: "bodyweight", movementType: "push" },
  { name: "Pec Deck Machine",           muscleGroup: "chest",     category: "isolation",  equipment: "machine",    movementType: "push" },

  // ── Back ───────────────────────────────────────────────────────────
  { name: "Barbell Row",                muscleGroup: "back",      category: "compound",  equipment: "barbell",    movementType: "pull" },
  { name: "Deadlift",                   muscleGroup: "back",      category: "compound",  equipment: "barbell",    movementType: "hinge" },
  { name: "Pull-Up",                    muscleGroup: "back",      category: "compound",  equipment: "bodyweight", movementType: "pull" },
  { name: "Lat Pulldown",              muscleGroup: "back",      category: "compound",  equipment: "cable",      movementType: "pull" },
  { name: "Dumbbell Row",              muscleGroup: "back",      category: "compound",  equipment: "dumbbell",   movementType: "pull" },
  { name: "Seated Cable Row",          muscleGroup: "back",      category: "compound",  equipment: "cable",      movementType: "pull" },
  { name: "T-Bar Row",                 muscleGroup: "back",      category: "compound",  equipment: "barbell",    movementType: "pull" },
  { name: "Face Pull",                 muscleGroup: "back",      category: "isolation",  equipment: "cable",      movementType: "pull" },
  { name: "Chin-Up",                   muscleGroup: "back",      category: "compound",  equipment: "bodyweight", movementType: "pull" },

  // ── Shoulders ──────────────────────────────────────────────────────
  { name: "Overhead Press",            muscleGroup: "shoulders",  category: "compound",  equipment: "barbell",    movementType: "push" },
  { name: "Dumbbell Shoulder Press",   muscleGroup: "shoulders",  category: "compound",  equipment: "dumbbell",   movementType: "push" },
  { name: "Lateral Raise",            muscleGroup: "shoulders",  category: "isolation",  equipment: "dumbbell",   movementType: "push" },
  { name: "Cable Lateral Raise",      muscleGroup: "shoulders",  category: "isolation",  equipment: "cable",      movementType: "push" },
  { name: "Rear Delt Fly",            muscleGroup: "shoulders",  category: "isolation",  equipment: "dumbbell",   movementType: "pull" },
  { name: "Arnold Press",             muscleGroup: "shoulders",  category: "compound",  equipment: "dumbbell",   movementType: "push" },
  { name: "Machine Shoulder Press",   muscleGroup: "shoulders",  category: "compound",  equipment: "machine",    movementType: "push" },
  { name: "Front Raise",              muscleGroup: "shoulders",  category: "isolation",  equipment: "dumbbell",   movementType: "push" },

  // ── Legs ───────────────────────────────────────────────────────────
  { name: "Barbell Back Squat",        muscleGroup: "legs",      category: "compound",  equipment: "barbell",    movementType: "squat" },
  { name: "Front Squat",              muscleGroup: "legs",      category: "compound",  equipment: "barbell",    movementType: "squat" },
  { name: "Romanian Deadlift",        muscleGroup: "legs",      category: "compound",  equipment: "barbell",    movementType: "hinge" },
  { name: "Leg Press",                muscleGroup: "legs",      category: "compound",  equipment: "machine",    movementType: "squat" },
  { name: "Bulgarian Split Squat",    muscleGroup: "legs",      category: "compound",  equipment: "dumbbell",   movementType: "squat" },
  { name: "Leg Extension",            muscleGroup: "legs",      category: "isolation",  equipment: "machine",    movementType: "push" },
  { name: "Leg Curl",                 muscleGroup: "legs",      category: "isolation",  equipment: "machine",    movementType: "pull" },
  { name: "Barbell Hip Thrust",       muscleGroup: "legs",      category: "compound",  equipment: "barbell",    movementType: "hinge" },
  { name: "Goblet Squat",             muscleGroup: "legs",      category: "compound",  equipment: "dumbbell",   movementType: "squat" },
  { name: "Calf Raise",               muscleGroup: "legs",      category: "isolation",  equipment: "machine",    movementType: "push" },
  { name: "Walking Lunge",            muscleGroup: "legs",      category: "compound",  equipment: "dumbbell",   movementType: "squat" },

  // ── Arms ───────────────────────────────────────────────────────────
  { name: "Barbell Curl",             muscleGroup: "arms",      category: "isolation",  equipment: "barbell",    movementType: "pull" },
  { name: "Dumbbell Curl",            muscleGroup: "arms",      category: "isolation",  equipment: "dumbbell",   movementType: "pull" },
  { name: "Hammer Curl",              muscleGroup: "arms",      category: "isolation",  equipment: "dumbbell",   movementType: "pull" },
  { name: "Cable Curl",               muscleGroup: "arms",      category: "isolation",  equipment: "cable",      movementType: "pull" },
  { name: "Tricep Pushdown",          muscleGroup: "arms",      category: "isolation",  equipment: "cable",      movementType: "push" },
  { name: "Skull Crusher",            muscleGroup: "arms",      category: "isolation",  equipment: "barbell",    movementType: "push" },
  { name: "Overhead Tricep Extension", muscleGroup: "arms",     category: "isolation",  equipment: "dumbbell",   movementType: "push" },
  { name: "Dip",                      muscleGroup: "arms",      category: "compound",  equipment: "bodyweight", movementType: "push" },
  { name: "Preacher Curl",            muscleGroup: "arms",      category: "isolation",  equipment: "barbell",    movementType: "pull" },
  { name: "Concentration Curl",       muscleGroup: "arms",      category: "isolation",  equipment: "dumbbell",   movementType: "pull" },

  // ── Core ───────────────────────────────────────────────────────────
  { name: "Plank",                     muscleGroup: "core",      category: "isolation",  equipment: "bodyweight", movementType: "push" },
  { name: "Hanging Leg Raise",        muscleGroup: "core",      category: "isolation",  equipment: "bodyweight", movementType: "pull" },
  { name: "Cable Woodchop",           muscleGroup: "core",      category: "compound",  equipment: "cable",      movementType: "pull" },
  { name: "Ab Rollout",               muscleGroup: "core",      category: "isolation",  equipment: "bodyweight", movementType: "push" },
  { name: "Farmer Walk",              muscleGroup: "core",      category: "compound",  equipment: "dumbbell",   movementType: "carry" },
  { name: "Suitcase Carry",           muscleGroup: "core",      category: "compound",  equipment: "dumbbell",   movementType: "carry" },
];

async function main() {
  console.log("🌱 Seeding exercises...");

  const result = await prisma.exercise.createMany({
    data: exercises,
    skipDuplicates: true,
  });

  console.log(`✅ Seeded ${result.count} exercises (${exercises.length} total, duplicates skipped).`);
}

main()
  .catch((error) => {
    console.error("❌ Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
