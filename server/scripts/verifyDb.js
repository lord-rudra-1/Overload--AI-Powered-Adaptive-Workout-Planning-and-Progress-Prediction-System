const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function verify() {
  try {
    console.log("\n================ OVERLOAD DATABASE SUMMARY ================\n");

    const [userCount, goalCount, workoutCount, logCount, exerciseCount] = await Promise.all([
      prisma.user.count(),
      prisma.goal.count(),
      prisma.workout.count(),
      prisma.performanceLog.count(),
      prisma.exercise.count(),
    ]);

    console.log(`📊 TOTAL COUNTS:`);
    console.log(`   - Users:            ${userCount}`);
    console.log(`   - Exercises:        ${exerciseCount}`);
    console.log(`   - Strength Goals:   ${goalCount}`);
    console.log(`   - Workouts:         ${workoutCount}`);
    console.log(`   - Performance Logs: ${logCount}\n`);

    console.log(`👥 USER BREAKDOWN:`);
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            goals: true,
            workouts: true,
            performances: true,
          },
        },
      },
      orderBy: { id: "asc" },
    });

    users.forEach((u) => {
      console.log(`   [User #${u.id}] ${u.name.padEnd(10)} (${u.email})`);
      console.log(`      Body Weight: ${u.bodyWeight} kg | Exp: ${u.experience} | Training Days: ${u.trainingDays}/wk`);
      console.log(`      Active Goals: ${u._count.goals} | Total Workouts: ${u._count.workouts} | Completed Sets: ${u._count.performances}\n`);
    });

    console.log(`🏋️ RECENT COMPLETED WORKOUTS (SAMPLE):`);
    const recentWorkouts = await prisma.workout.findMany({
      where: { status: "COMPLETED" },
      take: 5,
      orderBy: { date: "desc" },
      include: {
        user: { select: { name: true } },
        _count: { select: { exercises: true } },
      },
    });

    recentWorkouts.forEach((w) => {
      console.log(`   - ${w.date.toISOString().split("T")[0]} | ${w.user.name.padEnd(10)} | ${w.notes.padEnd(25)} | ${w.duration} mins | ${w._count.exercises} movements`);
    });

    console.log("\n===========================================================\n");
  } catch (err) {
    console.error("❌ Verification error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

verify();

