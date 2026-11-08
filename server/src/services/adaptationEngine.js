/**
 * Overload Adaptation Engine
 * 
 * Implements deterministic rules to adapt the next workout prescription
 * based on actual logged performance, subjective RPE, and training adherence.
 * 
 * Design rule from project proposal:
 * "Adaptation decides. Prediction only informs. Safety can always override both."
 */

/**
 * Evaluates performance and generates the next prescription for an exercise
 * 
 * @param {Object} params
 * @param {Object} params.exercise - { id, name, category, muscleGroup }
 * @param {Object} params.lastPrescription - { targetWeight, targetReps, targetSets, targetRPE }
 * @param {Array<Object>} params.performedSets - [{ setNumber, weight, repetitions, rpe }]
 * @param {Object} params.userProfile - { experience, increment, trainingDays, bodyWeight }
 * @param {Object} params.metrics - { adherence, rpeTrend, consecutiveHeavySessions }
 * 
 * @returns {Object} adaptedPrescription - {
 *   weight: number,
 *   reps: number,
 *   sets: number,
 *   rpe: number,
 *   ruleApplied: string,
 *   reasoning: string,
 *   isDeload: boolean
 * }
 */
function adaptExercisePrescription({
  exercise,
  lastPrescription,
  performedSets = [],
  userProfile = {},
  metrics = {},
}) {
  const increment = parseFloat(userProfile.increment) || 2.5;
  const currentWeight = parseFloat(lastPrescription?.targetWeight) || 20;
  const targetReps = parseInt(lastPrescription?.targetReps, 10) || 10;
  const targetSets = parseInt(lastPrescription?.targetSets, 10) || 3;
  const targetRPE = parseFloat(lastPrescription?.targetRPE) || 8.0;

  const adherence = typeof metrics.adherence === "number" ? metrics.adherence : 1.0;
  const rpeTrend = typeof metrics.rpeTrend === "number" ? metrics.rpeTrend : null;
  const consecutiveHeavySessions = metrics.consecutiveHeavySessions || 0;

  // RULE 3: DELOAD DETECTION
  // If user has suffered 2+ consecutive sessions with average RPE > 9.0
  if (consecutiveHeavySessions >= 2 || (rpeTrend && rpeTrend >= 9.2)) {
    const deloadWeight = Math.max(10, Math.round((currentWeight * 0.8) / increment) * increment);
    const deloadSets = Math.max(2, Math.round(targetSets * 0.6));
    return {
      weight: deloadWeight,
      reps: targetReps,
      sets: deloadSets,
      rpe: 6.5,
      ruleApplied: "RULE_3_DELOAD",
      reasoning: `Fatigue accumulation detected (consecutive high RPE sessions). Prescribing deload: -20% load (${deloadWeight} kg) and reduced volume (${deloadSets} sets).`,
      isDeload: true,
    };
  }

  // Calculate actual performance vs prescription
  if (!performedSets || performedSets.length === 0) {
    // No performance logged (e.g. skipped exercise) -> maintain prescription
    return {
      weight: currentWeight,
      reps: targetReps,
      sets: targetSets,
      rpe: targetRPE,
      ruleApplied: "NO_LOGS_MAINTAIN",
      reasoning: "No prior performance logged for this exercise. Maintaining target prescription.",
      isDeload: false,
    };
  }

  const completedSetsCount = performedSets.length;
  const setsMeetingReps = performedSets.filter((s) => (s.repetitions || 0) >= targetReps).length;
  const avgActualRpe =
    performedSets.filter((s) => s.rpe).length > 0
      ? performedSets.reduce((sum, s) => sum + (s.rpe || 0), 0) /
        performedSets.filter((s) => s.rpe).length
      : targetRPE;

  let newWeight = currentWeight;
  let newReps = targetReps;
  let newSets = targetSets;
  // If recovering from a deload session, restore baseline target RPE (8.0)
  let newRPE = lastPrescription?.isDeload || targetRPE < 7.0 ? 8.0 : targetRPE;
  let ruleApplied = "RULE_1_LOAD_ADJUSTMENT";
  let reasoning = "";

  // RULE 1: PERFORMANCE-BASED LOAD ADJUSTMENT
  const hitAllReps = completedSetsCount >= targetSets && setsMeetingReps >= targetSets;

  if (hitAllReps) {
    if (avgActualRpe <= targetRPE) {
      // Met reps comfortably or at target RPE -> OVERLOAD: Add weight!
      newWeight = currentWeight + increment;
      ruleApplied = "RULE_1_PROGRESSIVE_OVERLOAD";
      reasoning = `Completed all ${targetSets} sets of ${targetReps} reps at RPE ${avgActualRpe.toFixed(
        1
      )} <= target ${targetRPE}. Progressing weight by +${increment} kg.`;
    } else {
      // Completed all reps, but effort was near failure (> target + 0.5)
      newWeight = currentWeight;
      ruleApplied = "RULE_1_FATIGUE_CONSOLIDATION";
      reasoning = `Completed target reps, but perceived effort was high (RPE ${avgActualRpe.toFixed(
        1
      )} > target ${targetRPE}). Maintaining weight at ${currentWeight} kg to solidify adaptation.`;
    }
  } else {
    // Missed reps or completed fewer sets than prescribed
    const totalRepsExpected = targetSets * targetReps;
    const totalRepsDone = performedSets.reduce((sum, s) => sum + (s.repetitions || 0), 0);
    const completionRate = totalRepsExpected > 0 ? totalRepsDone / totalRepsExpected : 0;

    if (completionRate < 0.8) {
      // Significant shortfall (< 80% reps) -> drop weight to safe baseline
      newWeight = Math.max(increment, currentWeight - increment);
      ruleApplied = "RULE_1_LOAD_REDUCTION";
      reasoning = `Completed ${totalRepsDone}/${totalRepsExpected} target repetitions. Deloading by -${increment} kg to rebuild volume.`;
    } else {
      // Slight shortfall -> maintain load, strive to complete reps next session
      newWeight = currentWeight;
      ruleApplied = "RULE_1_LOAD_MAINTAIN";
      reasoning = `Completed ${totalRepsDone}/${totalRepsExpected} repetitions. Maintaining ${currentWeight} kg to achieve full volume target before increasing load.`;
    }
  }

  // RULE 2: VOLUME ADJUSTMENT (ADHERENCE & CAPACITY)
  if (adherence < 0.7 && newSets > 2) {
    newSets = newSets - 1;
    reasoning += ` Adherence rate (${Math.round(
      adherence * 100
    )}%) is low; reducing volume to ${newSets} sets to improve recovery and session completion.`;
  } else if (adherence >= 0.95 && rpeTrend && rpeTrend < 7.5 && newSets < 5) {
    newSets = newSets + 1;
    reasoning += ` High adherence (${Math.round(
      adherence * 100
    )}%) and low fatigue detected (RPE trend ${rpeTrend}); increasing volume to ${newSets} sets.`;
  }

  return {
    weight: Math.round(newWeight * 100) / 100,
    reps: newReps,
    sets: newSets,
    rpe: newRPE,
    ruleApplied,
    reasoning,
    isDeload: false,
  };
}

module.exports = {
  adaptExercisePrescription,
};
