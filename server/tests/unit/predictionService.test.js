import { describe, it, expect } from "vitest";
const { predictExerciseProgress } = require("../../src/services/predictionService");

describe("Progress Prediction Service — Regression & Forecasting", () => {
  it("returns INSUFFICIENT_DATA when history has fewer than 3 sessions", () => {
    const logs = [
      { date: "2026-01-01T10:00:00Z", weight: 60, repetitions: 10 },
      { date: "2026-01-08T10:00:00Z", weight: 62.5, repetitions: 10 },
    ];
    const report = predictExerciseProgress(logs, 100);
    expect(report.status).toBe("INSUFFICIENT_DATA");
    expect(report.forecast.length).toBe(0);
  });

  it("fits linear regression and projects arrival timeline for progressing athlete", () => {
    // 4 sessions spaced 1 week apart with +2.5kg steady progression
    const logs = [
      { date: "2026-01-01T10:00:00Z", weight: 60, repetitions: 10 },   // e1rm = 80kg
      { date: "2026-01-08T10:00:00Z", weight: 62.5, repetitions: 10 }, // e1rm = 83.3kg
      { date: "2026-01-15T10:00:00Z", weight: 65, repetitions: 10 },   // e1rm = 86.7kg
      { date: "2026-01-22T10:00:00Z", weight: 67.5, repetitions: 10 }, // e1rm = 90kg
    ];

    const report = predictExerciseProgress(logs, 100, 8);

    expect(report.status).toBe("ACTIVE");
    expect(report.weeklyGainKg).toBeGreaterThan(3.0); // ~3.33 kg/week
    expect(report.weeksToGoal).toBeGreaterThan(0);
    expect(report.forecast.length).toBe(8);
    expect(report.forecast[0].predicted1RM).toBeGreaterThan(report.current1RM);
    expect(report.forecast[0].upperBound).toBeGreaterThan(report.forecast[0].lowerBound);
  });

  it("identifies when goal is already achieved", () => {
    const logs = [
      { date: "2026-01-01T10:00:00Z", weight: 100, repetitions: 10 },
      { date: "2026-01-08T10:00:00Z", weight: 102.5, repetitions: 10 },
      { date: "2026-01-15T10:00:00Z", weight: 105, repetitions: 10 }, // e1rm = 140kg
    ];
    const report = predictExerciseProgress(logs, 120);
    expect(report.goalStatus).toBe("ACHIEVED");
    expect(report.weeksToGoal).toBe(0);
  });
});
