import { describe, it, expect } from "vitest";
const { enforceSafetyConstraints } = require("../../src/services/safetyLayer");

describe("Safety Layer — Feasibility & Injury Prevention Constraints", () => {
  it("Constraint 1: Clamps excessive weight jumps (>10%) to safe ceiling", () => {
    // Current is 60kg. User typo or radical jump tries to prescribe 80kg (+33%)
    const proposed = { weight: 80, reps: 10, sets: 3, rpe: 8.0, ruleApplied: "RULE_1" };
    const last = { targetWeight: 60 };
    const user = { increment: 2.5, bodyWeight: 75, experience: "intermediate" };

    const check = enforceSafetyConstraints(proposed, last, user);

    expect(check.overridden).toBe(true);
    // 60 * 1.10 = 66kg, rounded to 2.5kg = 65kg
    expect(check.safePrescription.weight).toBeLessThanOrEqual(66);
    expect(check.adjustments[0]).toContain("Single-session weight jump restricted");
  });

  it("Constraint 2: Caps beginner target RPE at 8.0", () => {
    const proposed = { weight: 50, reps: 10, sets: 3, rpe: 9.5 };
    const user = { experience: "beginner", bodyWeight: 70 };

    const check = enforceSafetyConstraints(proposed, { targetWeight: 50 }, user);

    expect(check.overridden).toBe(true);
    expect(check.safePrescription.rpe).toBe(8.0);
    expect(check.adjustments[0]).toContain("Target RPE capped at 8.0 for beginner");
  });

  it("Constraint 3: Enforces mandatory recovery deload after 5 consecutive progressive weeks", () => {
    const proposed = { weight: 100, reps: 8, sets: 4, rpe: 8.0, isDeload: false };
    const user = { increment: 2.5 };
    const context = { consecutiveProgressionWeeks: 5 };

    const check = enforceSafetyConstraints(proposed, { targetWeight: 97.5 }, user, context);

    expect(check.overridden).toBe(true);
    expect(check.safePrescription.isDeload).toBe(true);
    expect(check.safePrescription.weight).toBe(80); // 100 * 0.8
    expect(check.safePrescription.sets).toBe(2);    // 4 * 0.6 = 2 sets
  });
});
