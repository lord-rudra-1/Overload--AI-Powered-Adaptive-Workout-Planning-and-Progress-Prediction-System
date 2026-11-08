/**
 * Overload Safety & Feasibility Layer
 * 
 * Central safety constraint enforcement that governs all workout prescriptions.
 * 
 * Core Design Rule:
 * "Adaptation decides. Prediction only informs. Safety can always override both."
 */

/**
 * Validates and constrains any proposed prescription against injury and overtraining limits
 * 
 * @param {Object} prescription - { weight, reps, sets, rpe, ruleApplied, reasoning }
 * @param {Object} lastPrescription - previous target values
 * @param {Object} userProfile - { experience, bodyWeight, increment }
 * @param {Object} context - { recentWeeklyVolumes, consecutiveProgressionWeeks }
 * 
 * @returns {{
 *   safePrescription: Object,
 *   adjustments: Array<string>,
 *   warnings: Array<string>,
 *   overridden: boolean
 * }}
 */
function enforceSafetyConstraints(
  prescription,
  lastPrescription = {},
  userProfile = {},
  context = {}
) {
  const safePrescription = { ...prescription };
  const adjustments = [];
  const warnings = [];
  let overridden = false;

  const currentWeight = parseFloat(lastPrescription.targetWeight) || safePrescription.weight;
  const bodyWeight = parseFloat(userProfile.bodyWeight) || 75;
  const experience = (userProfile.experience || "beginner").toLowerCase();
  const increment = parseFloat(userProfile.increment) || 2.5;

  // CONSTRAINT 1: MAX SINGLE-SESSION LOAD JUMP (<= 10%)
  // Protects against user typos (e.g. entering 160 instead of 60)
  if (currentWeight > 0 && safePrescription.weight > currentWeight) {
    const maxAllowedWeight = currentWeight * 1.10;
    if (safePrescription.weight > maxAllowedWeight) {
      const clampedWeight = Math.round(maxAllowedWeight / increment) * increment;
      adjustments.push(
        `Safety Constraint 1: Single-session weight jump restricted from ${safePrescription.weight} kg to ${clampedWeight} kg (max 10% jump).`
      );
      safePrescription.weight = clampedWeight;
      overridden = true;
    }
  }

  // CONSTRAINT 2: BEGINNER GUARDRAILS
  // Beginners should not train to failure (cap target RPE at 8.0)
  if (experience === "beginner") {
    if (safePrescription.rpe && safePrescription.rpe > 8.0) {
      adjustments.push(
        `Safety Constraint 2: Target RPE capped at 8.0 for beginner athlete to ensure proper motor control.`
      );
      safePrescription.rpe = 8.0;
      overridden = true;
    }

    // Compound weight cap for beginners (max 1.5x body weight)
    const maxBeginnerCompound = bodyWeight * 1.5;
    if (safePrescription.weight > maxBeginnerCompound) {
      adjustments.push(
        `Safety Constraint 2: Weight capped at 1.5x body weight (${maxBeginnerCompound} kg) for beginner safety threshold.`
      );
      safePrescription.weight = maxBeginnerCompound;
      overridden = true;
    }
  }

  // CONSTRAINT 3: MANDATORY RECOVERY DELOAD AFTER 5 CONSECUTIVE WEEKS OF PROGRESSION
  if (context.consecutiveProgressionWeeks >= 5 && !safePrescription.isDeload) {
    const deloadWeight = Math.max(10, Math.round((safePrescription.weight * 0.8) / increment) * increment);
    const deloadSets = Math.max(2, Math.round(safePrescription.sets * 0.6));

    adjustments.push(
      `Safety Constraint 3: 5+ consecutive weeks of progression detected. Safety layer enforced restorative deload (-20% load, -40% volume).`
    );
    safePrescription.weight = deloadWeight;
    safePrescription.sets = deloadSets;
    safePrescription.rpe = 6.5;
    safePrescription.isDeload = true;
    overridden = true;
  }

  // CONSTRAINT 4: MINIMUM SETS AND REPS SANITY
  if (safePrescription.sets < 1) safePrescription.sets = 1;
  if (safePrescription.sets > 6) {
    adjustments.push(`Safety Constraint 4: Volume capped at 6 maximum sets per exercise.`);
    safePrescription.sets = 6;
    overridden = true;
  }

  if (safePrescription.reps < 1) safePrescription.reps = 1;

  return {
    safePrescription,
    adjustments,
    warnings,
    overridden,
  };
}

module.exports = {
  enforceSafetyConstraints,
};
