import { describe, it, expect } from "vitest";
const { calculateEpley1RM, getPeakSession1RM, build1RMHistory } = require("../../src/services/estimator");

describe("1RM Estimator — Epley Formula Validations", () => {
  it("calculates 1RM accurately: 100kg for 10 reps = 133.3kg", () => {
    // 1RM = 100 * (1 + 10 / 30) = 100 * (1.3333...) = 133.3kg
    const e1rm = calculateEpley1RM(100, 10);
    expect(e1rm).toBe(133.3);
  });

  it("single repetition returns exact weight without inflation", () => {
    const e1rm = calculateEpley1RM(100, 1);
    expect(e1rm).toBe(100);
  });

  it("handles zero or negative inputs safely", () => {
    expect(calculateEpley1RM(0, 5)).toBe(0);
    expect(calculateEpley1RM(100, 0)).toBe(0);
  });

  it("finds peak session 1RM among multiple sets", () => {
    const sets = [
      { weight: 80, repetitions: 12 }, // e1rm = 80 * (1 + 12/30) = 112kg
      { weight: 90, repetitions: 8 },  // e1rm = 90 * (1 + 8/30) = 114kg
      { weight: 100, repetitions: 5 }, // e1rm = 100 * (1 + 5/30) = 116.7kg -> Peak
    ];
    const peak = getPeakSession1RM(sets);
    expect(peak).toBe(116.7);
  });

  it("builds chronological history grouped by date", () => {
    const logs = [
      { date: "2026-01-01T10:00:00Z", weight: 60, repetitions: 10 },
      { date: "2026-01-01T10:05:00Z", weight: 60, repetitions: 12 }, // Higher on same day
      { date: "2026-01-05T10:00:00Z", weight: 62.5, repetitions: 10 },
    ];
    const history = build1RMHistory(logs);
    expect(history.length).toBe(2);
    expect(history[0].date).toBe("2026-01-01");
    expect(history[0].e1rm).toBe(84); // 60 * (1 + 12/30)
    expect(history[1].date).toBe("2026-01-05");
  });
});
