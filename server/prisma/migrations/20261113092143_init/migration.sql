-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "age" INTEGER,
    "gender" TEXT,
    "bodyWeight" DOUBLE PRECISION,
    "experience" TEXT,
    "trainingDays" INTEGER NOT NULL DEFAULT 3,
    "equipment" TEXT,
    "increment" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "exerciseId" INTEGER NOT NULL,
    "targetWeight" DOUBLE PRECISION NOT NULL,
    "targetDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "muscleGroup" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "equipment" TEXT,
    "movementType" TEXT,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workout" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "weekNum" INTEGER,
    "dayNum" INTEGER,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "notes" TEXT,
    "duration" INTEGER,

    CONSTRAINT "Workout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutExercise" (
    "id" SERIAL NOT NULL,
    "workoutId" INTEGER NOT NULL,
    "exerciseId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "targetWeight" DOUBLE PRECISION NOT NULL,
    "targetReps" INTEGER NOT NULL,
    "targetSets" INTEGER NOT NULL,
    "targetRPE" DOUBLE PRECISION,

    CONSTRAINT "WorkoutExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "exerciseId" INTEGER NOT NULL,
    "workoutId" INTEGER,
    "setNumber" INTEGER NOT NULL DEFAULT 1,
    "weight" DOUBLE PRECISION NOT NULL,
    "repetitions" INTEGER NOT NULL,
    "rpe" DOUBLE PRECISION,
    "rir" DOUBLE PRECISION,
    "duration" INTEGER,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "PerformanceLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_name_key" ON "Exercise"("name");

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceLog" ADD CONSTRAINT "PerformanceLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceLog" ADD CONSTRAINT "PerformanceLog_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
