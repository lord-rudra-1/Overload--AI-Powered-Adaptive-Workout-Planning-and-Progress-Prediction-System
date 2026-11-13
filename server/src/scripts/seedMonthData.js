const prisma = require("../db");

/**
 * Seeds rich, realistic 1-month training history and profile configuration
 * for all registered users in the database.
 */
async function seedMonthHistory() {
  try {
    console.log("⏳ Starting 1-month historical data generation for all users...");

    const allExercises = await prisma.exercise.findMany();
    if (allExercises.length === 0) {
      console.warn("⚠️ No exercises found in database. Run seed first.");
      return;
    }

    const exMap = {};
    allExercises.forEach((ex) => {
      exMap[ex.name] = ex;
    });

    const bench = exMap["Barbell Bench Press"] || allExercises[0];
    const squat = exMap["Barbell Back Squat"] || allExercises[1];
    const deadlift = exMap["Deadlift"] || exMap["Romanian Deadlift"] || allExercises[2];
    const row = exMap["Barbell Row"] || allExercises[3];
    const ohp = exMap["Overhead Press"] || allExercises[4];
    const curl = exMap["Barbell Curl"] || exMap["Dumbbell Curl"] || allExercises[5];
    const legPress = exMap["Leg Press"] || squat;
    const dip = exMap["Dip"] || exMap["Push-Up"] || bench;
    const latPulldown = exMap["Lat Pulldown"] || exMap["Pull-Up"] || row;

    const users = await prisma.user.findMany();
    if (users.length === 0) {
      console.log("ℹ️ No users found to seed history.");
      return;
    }

    // Baseline profiles for users
    const userProfiles = {
      "rishabh@overload.com": {
        age: 22,
        gender: "male",
        bodyWeight: 68.0,
        experience: "intermediate",
        trainingDays: 4,
        equipment: "full_gym",
        increment: 2.5,
        baseBench: 55,
        baseSquat: 75,
        baseDeadlift: 90,
      },
      "divyansh@overload.com": {
        age: 21,
        gender: "male",
        bodyWeight: 74.5,
        experience: "intermediate",
        trainingDays: 4,
        equipment: "full_gym",
        increment: 2.5,
        baseBench: 62.5,
        baseSquat: 85,
        baseDeadlift: 105,
      },
      "jatin@overload.com": {
        age: 23,
        gender: "male",
        bodyWeight: 80.0,
        experience: "advanced",
        trainingDays: 5,
        equipment: "full_gym",
        increment: 2.5,
        baseBench: 75,
        baseSquat: 105,
        baseDeadlift: 130,
      },
      "rudra@overload.com": {
        age: 22,
        gender: "male",
        bodyWeight: 71.0,
        experience: "beginner",
        trainingDays: 3,
        equipment: "full_gym",
        increment: 2.5,
        baseBench: 45,
        baseSquat: 60,
        baseDeadlift: 75,
      },
    };

    const now = new Date();

    for (const user of users) {
      const config = userProfiles[user.email] || {
        age: user.age || 22,
        gender: user.gender || "male",
        bodyWeight: user.bodyWeight || 70.0,
        experience: user.experience || "intermediate",
        trainingDays: user.trainingDays || 4,
        equipment: user.equipment || "full_gym",
        increment: user.increment || 2.5,
        baseBench: 55,
        baseSquat: 75,
        baseDeadlift: 90,
      };

      // 1. Update user profile fields so none are null
      await prisma.user.update({
        where: { id: user.id },
        data: {
          age: config.age,
          gender: config.gender,
          bodyWeight: config.bodyWeight,
          experience: config.experience,
          trainingDays: config.trainingDays,
          equipment: config.equipment,
          increment: config.increment,
        },
      });

      // 2. Add realistic Goals if none exist
      const existingGoals = await prisma.goal.findMany({ where: { userId: user.id } });
      if (existingGoals.length === 0) {
        const targetDate = new Date();
        targetDate.setMonth(targetDate.getMonth() + 2);

        await prisma.goal.createMany({
          data: [
            {
              userId: user.id,
              exerciseId: bench.id,
              targetWeight: config.baseBench + 20,
              targetDate,
              status: "ACTIVE",
            },
            {
              userId: user.id,
              exerciseId: squat.id,
              targetWeight: config.baseSquat + 30,
              targetDate,
              status: "ACTIVE",
            },
            {
              userId: user.id,
              exerciseId: deadlift.id,
              targetWeight: config.baseDeadlift + 35,
              targetDate,
              status: "ACTIVE",
            },
          ],
        });
      }

      // 3. Clean up any existing uncompleted workouts to remove duplicates
      const uncompleted = await prisma.workout.findMany({
        where: {
          userId: user.id,
          status: { in: ["PLANNED", "IN_PROGRESS"] },
        },
        select: { id: true },
      });

      if (uncompleted.length > 0) {
        const uncompletedIds = uncompleted.map((w) => w.id);
        await prisma.workoutExercise.deleteMany({
          where: { workoutId: { in: uncompletedIds } },
        });
        await prisma.workout.deleteMany({
          where: { id: { in: uncompletedIds } },
        });
      }

      // 4. Generate 12 historical completed sessions over the last 28 days
      // 4 weeks: 3 workouts per week (e.g. Day -27, -25, -23, -20, -18, -16, -13, -11, -9, -6, -4, -2)
      const dayOffsets = [-27, -25, -23, -20, -18, -16, -13, -11, -9, -6, -4, -2];

      // Remove previous performance logs & completed workouts only if re-running
      await prisma.performanceLog.deleteMany({ where: { userId: user.id } });
      await prisma.workout.deleteMany({ where: { userId: user.id } });

      for (let sessionIdx = 0; sessionIdx < dayOffsets.length; sessionIdx++) {
        const dayOffset = dayOffsets[sessionIdx];
        const sessionDate = new Date(now);
        sessionDate.setDate(now.getDate() + dayOffset);
        sessionDate.setHours(18, 15, 0, 0); // 6:15 PM workout

        const weekIndex = Math.floor(sessionIdx / 3); // 0, 1, 2, 3
        const dayInWeek = sessionIdx % 3; // 0 (Upper), 1 (Lower), 2 (Full Body / Push-Pull)

        // Progressive overload progression per week:
        const benchWeight = config.baseBench + weekIndex * 2.5;
        const squatWeight = config.baseSquat + weekIndex * 5.0;
        const deadliftWeight = config.baseDeadlift + weekIndex * 5.0;
        const rowWeight = config.baseBench * 0.85 + weekIndex * 2.5;
        const ohpWeight = config.baseBench * 0.6 + weekIndex * 1.5;

        let workoutTitle = "";
        let sessionExercises = [];

        if (dayInWeek === 0) {
          workoutTitle = "Upper Body Heavy";
          sessionExercises = [
            { ex: bench, weight: benchWeight, sets: 3, reps: [10, 10, 9], rpes: [7.5, 8.0, 8.5] },
            { ex: row, weight: Math.round(rowWeight * 2) / 2, sets: 3, reps: [10, 10, 10], rpes: [7.5, 8.0, 8.0] },
            { ex: ohp, weight: Math.round(ohpWeight * 2) / 2, sets: 3, reps: [8, 8, 8], rpes: [8.0, 8.0, 8.5] },
            { ex: curl, weight: 15 + weekIndex * 1.0, sets: 3, reps: [12, 11, 10], rpes: [8.0, 8.5, 9.0] },
          ];
        } else if (dayInWeek === 1) {
          workoutTitle = "Lower Body Hypertrophy";
          sessionExercises = [
            { ex: squat, weight: squatWeight, sets: 3, reps: [8, 8, 8], rpes: [8.0, 8.0, 8.5] },
            { ex: deadlift, weight: deadliftWeight, sets: 3, reps: [6, 6, 6], rpes: [8.0, 8.5, 8.5] },
            { ex: legPress, weight: squatWeight * 1.4, sets: 3, reps: [10, 10, 10], rpes: [7.5, 8.0, 8.0] },
          ];
        } else {
          workoutTitle = "Full Body Adaptation";
          sessionExercises = [
            { ex: bench, weight: benchWeight, sets: 3, reps: [8, 8, 8], rpes: [8.0, 8.0, 8.5] },
            { ex: squat, weight: squatWeight, sets: 3, reps: [8, 8, 7], rpes: [8.0, 8.5, 9.0] },
            { ex: latPulldown, weight: rowWeight, sets: 3, reps: [10, 10, 9], rpes: [8.0, 8.0, 8.5] },
            { ex: dip, weight: 0, sets: 3, reps: [12, 11, 10], rpes: [8.0, 8.5, 9.0] },
          ];
        }

        // Create completed workout
        const workout = await prisma.workout.create({
          data: {
            userId: user.id,
            weekNum: weekIndex + 1,
            dayNum: dayInWeek + 1,
            date: sessionDate,
            status: "COMPLETED",
            notes: workoutTitle,
            duration: 52 + Math.floor(Math.random() * 16),
            exercises: {
              create: sessionExercises.map((item, idx) => ({
                exerciseId: item.ex.id,
                order: idx,
                targetWeight: item.weight,
                targetReps: item.reps[0],
                targetSets: item.sets,
                targetRPE: 8.0,
              })),
            },
          },
        });

        // Create PerformanceLogs for each completed set
        for (const item of sessionExercises) {
          for (let s = 0; s < item.sets; s++) {
            const reps = item.reps[s] || 8;
            const rpe = item.rpes[s] || 8.0;
            const rir = Math.max(0, 10 - rpe);

            await prisma.performanceLog.create({
              data: {
                userId: user.id,
                exerciseId: item.ex.id,
                workoutId: workout.id,
                setNumber: s + 1,
                weight: item.weight,
                repetitions: reps,
                rpe,
                rir,
                date: sessionDate,
              },
            });
          }
        }
      }

      // 5. Create 3 upcoming PLANNED workouts for the current week
      const futureDays = [1, 3, 5];
      const titles = ["Full Body A", "Full Body B", "Full Body C"];

      for (let f = 0; f < 3; f++) {
        const futureDate = new Date(now);
        futureDate.setDate(now.getDate() + futureDays[f]);

        const nextBench = config.baseBench + 4 * 2.5;
        const nextSquat = config.baseSquat + 4 * 5.0;
        const nextDeadlift = config.baseDeadlift + 4 * 5.0;

        await prisma.workout.create({
          data: {
            userId: user.id,
            weekNum: 5,
            dayNum: f + 1,
            date: futureDate,
            status: "PLANNED",
            notes: titles[f],
            exercises: {
              create: [
                { exerciseId: bench.id, order: 0, targetWeight: nextBench, targetReps: 8, targetSets: 3, targetRPE: 8.0 },
                { exerciseId: squat.id, order: 1, targetWeight: nextSquat, targetReps: 8, targetSets: 3, targetRPE: 8.0 },
                { exerciseId: deadlift.id, order: 2, targetWeight: nextDeadlift, targetReps: 6, targetSets: 3, targetRPE: 8.0 },
                { exerciseId: row.id, order: 3, targetWeight: Math.round(nextBench * 0.85 * 2) / 2, targetReps: 10, targetSets: 3, targetRPE: 8.0 },
                { exerciseId: ohp.id, order: 4, targetWeight: Math.round(nextBench * 0.6 * 2) / 2, targetReps: 8, targetSets: 3, targetRPE: 8.0 },
              ],
            },
          },
        });
      }

      console.log(`✅ Seeded complete 1-month training history for ${user.name} (${user.email})`);
    }

    console.log("🎉 Successfully populated 1-month active history for all users!");
  } catch (err) {
    console.error("❌ Error seeding month history:", err);
  }
}

module.exports = { seedMonthHistory };

