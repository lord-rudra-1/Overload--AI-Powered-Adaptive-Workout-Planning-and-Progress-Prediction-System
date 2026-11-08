import { describe, it, expect } from "vitest";
const { adaptExercisePrescription } = require("../../src/services/adaptationEngine");

describe("Adaptation Engine — Rule-Level Correctness", () => {
  const dummyExercise = { id: 1, name: "Barbell Bench Press", category: "compound", muscleGroup: "chest" };
  const baselinePrescription = { targetWeight: 60, targetReps: 10, targetSets: 3, targetRPE: 8.0 };
  const userProfile = { increment: 2.5, experience: "intermediate" };

  it("Rule 1: Progressive Overload — increases load when all target reps are completed at target RPE", () => {
    const performedSets = [
      { setNumber: 1, weight: 60, repetitions: 10, rpe: 7.5 },
      { setNumber: 2, weight: 60, repetitions: 10, rpe: 8.0 },
      { setNumber: 3, weight: 60, repetitions: 10, rpe: 8.0 },
    ];

    const result = adaptExercisePrescription({
      exercise: dummyExercise,
      lastPrescription: baselinePrescription,
      performedSets,
      userProfile,
      metrics: { adherence: 1.0, rpeTrend: 7.8 },
    });

    expect(result.ruleApplied).toBe("RULE_1_PROGRESSIVE_OVERLOAD");
    expect(result.weight).toBe(62.5); // 60 + 2.5kg
    expect(result.reps).toBe(10);
    expect(result.sets).toBe(3);
  });

  it("Rule 1: Fatigue Consolidation — maintains weight when reps are achieved but RPE is excessive", () => {
    const performedSets = [
      { setNumber: 1, weight: 60, repetitions: 10, rpe: 9.0 },
      { setNumber: 2, weight: 60, repetitions: 10, rpe: 9.5 },
      { setNumber: 3, weight: 60, repetitions: 10, rpe: 10.0 }, // Achieved reps at complete failure
    ];

    const result = adaptExercisePrescription({
      exercise: dummyExercise,
      lastPrescription: baselinePrescription,
      performedSets,
      userProfile,
      metrics: { adherence: 1.0, rpeTrend: 8.5 },
    });

    expect(result.ruleApplied).toBe("RULE_1_FATIGUE_CONSOLIDATION");
    expect(result.weight).toBe(60); // Maintained load to solidify adaptation
  });

  it("Rule 1: Load Reduction — decreases load when repetitions fall below 80% completion", () => {
    const performedSets = [
      { setNumber: 1, weight: 60, repetitions: 8, rpe: 9.0 },
      { setNumber: 2, weight: 60, repetitions: 6, rpe: 9.5 },
      { setNumber: 3, weight: 60, repetitions: 5, rpe: 10.0 }, // 19 / 30 reps = 63%
    ];

    const result = adaptExercisePrescription({
      exercise: dummyExercise,
      lastPrescription: baselinePrescription,
      performedSets,
      userProfile,
      metrics: { adherence: 1.0 },
    });

    expect(result.ruleApplied).toBe("RULE_1_LOAD_REDUCTION");
    expect(result.weight).toBe(57.5); // 60 - 2.5kg
  });

  it("Rule 2: Volume Reduction — reduces sets when adherence is below 70%", () => {
    const performedSets = [
      { setNumber: 1, weight: 60, repetitions: 10, rpe: 8.0 },
      { setNumber: 2, weight: 60, repetitions: 10, rpe: 8.0 },
      { setNumber: 3, weight: 60, repetitions: 10, rpe: 8.0 },
    ];

    const result = adaptExercisePrescription({
      exercise: dummyExercise,
      lastPrescription: baselinePrescription,
      performedSets,
      userProfile,
      metrics: { adherence: 0.55 }, // Low adherence
    });

    expect(result.sets).toBe(2); // Reduced from 3 to 2 sets
  });

  it("Rule 3: Deload Detection — enforces deload on accumulated fatigue", () => {
    const performedSets = [
      { setNumber: 1, weight: 100, repetitions: 10, rpe: 9.5 },
    ];

    const result = adaptExercisePrescription({
      exercise: dummyExercise,
      lastPrescription: { targetWeight: 100, targetReps: 10, targetSets: 4, targetRPE: 8.0 },
      performedSets,
      userProfile,
      metrics: { consecutiveHeavySessions: 2 },
    });

    expect(result.isDeload).toBe(true);
    expect(result.ruleApplied).toBe("RULE_3_DELOAD");
    expect(result.weight).toBe(80); // 100 * 0.8 = 80kg
    expect(result.sets).toBe(2); // 4 * 0.6 = 2 sets
  });
});
