import { describe, it, expect } from "vitest";
const {
  calculateVolumeLoad,
  calculateSessionMetrics,
  calculateAdherence,
  calculateTrainingTrend,
} = require("../../src/services/trainingLoad");

describe("Training Load Models — Metric Calculations", () => {
  it("computes volume load as sum of weight * reps", () => {
    const sets = [
      { weight: 100, repetitions: 10 }, // 1000
      { weight: 100, repetitions: 8 },  // 800
      { weight: 90, repetitions: 10 },  // 900
    ];
    expect(calculateVolumeLoad(sets)).toBe(2700);
  });

  it("calculates session metrics with average RPE", () => {
    const logs = [
      { weight: 60, repetitions: 10, rpe: 7.5 },
      { weight: 60, repetitions: 10, rpe: 8.5 },
    ];
    const metrics = calculateSessionMetrics(logs);
    expect(metrics.totalVolume).toBe(1200);
    expect(metrics.totalSets).toBe(2);
    expect(metrics.totalReps).toBe(20);
    expect(metrics.avgRpe).toBe(8.0);
  });

  it("evaluates training trend classification based on 14-day rolling volumes", () => {
    const now = new Date();
    const day5 = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    const day20 = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000);

    const volumes = [
      { date: day20.toISOString(), volume: 10000 }, // prior 2-week window
      { date: day5.toISOString(), volume: 12000 },  // recent 2-week window (+20%)
    ];

    const trend = calculateTrainingTrend(volumes);
    expect(trend.trendRatio).toBe(1.2);
    expect(trend.classification).toBe("progressing");
  });
});
