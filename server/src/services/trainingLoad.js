/**
 * Training Load & Metric Calculations
 * 
 * Computes:
 * - Volume load per set: weight * reps
 * - Session load: sum of all set volume loads
 * - Weekly training load: sum of volume loads across 7-day windows
 * - Adherence rate: completed / planned workouts over 4 weeks
 * - Training load trend: ratio of recent 2-week average vs previous 2-week average
 * - RPE trend: rolling average RPE of recent sessions
 */

/**
 * Calculates volume load for a set or array of performance logs
 * @param {Array<{weight: number, repetitions: number}>} sets 
 * @returns {number}
 */
function calculateVolumeLoad(sets = []) {
  if (!Array.isArray(sets) || sets.length === 0) return 0;
  return sets.reduce((sum, s) => {
    const w = parseFloat(s.weight) || 0;
    const r = parseInt(s.repetitions, 10) || 0;
    return sum + w * r;
  }, 0);
}

/**
 * Calculates session summary from logs
 * @param {Array<{weight: number, repetitions: number, rpe?: number}>} logs 
 */
function calculateSessionMetrics(logs = []) {
  const totalVolume = calculateVolumeLoad(logs);
  const totalSets = logs.length;
  const totalReps = logs.reduce((sum, l) => sum + (parseInt(l.repetitions, 10) || 0), 0);
  
  const rpeLogs = logs.filter((l) => typeof l.rpe === "number" && !isNaN(l.rpe));
  const avgRpe =
    rpeLogs.length > 0
      ? rpeLogs.reduce((sum, l) => sum + l.rpe, 0) / rpeLogs.length
      : null;

  return {
    totalVolume: Math.round(totalVolume * 100) / 100,
    totalSets,
    totalReps,
    avgRpe: avgRpe ? Math.round(avgRpe * 10) / 10 : null,
  };
}

/**
 * Calculates adherence rate over the past N weeks
 * @param {Array<{date: Date|string, status: string}>} workouts 
 * @param {number} plannedSessionsPerWeek 
 * @param {number} weeksLookback 
 * @returns {number} fraction between 0.0 and 1.0 (e.g. 0.85 = 85%)
 */
function calculateAdherence(workouts = [], plannedSessionsPerWeek = 3, weeksLookback = 4) {
  if (plannedSessionsPerWeek <= 0) return 1.0;

  const now = new Date();
  const startDate = new Date();
  startDate.setDate(now.getDate() - weeksLookback * 7);

  const completedInWindow = workouts.filter((w) => {
    const wDate = new Date(w.date);
    return wDate >= startDate && wDate <= now && w.status === "COMPLETED";
  }).length;

  const totalExpected = plannedSessionsPerWeek * weeksLookback;
  if (totalExpected === 0) return 1.0;

  const adherence = completedInWindow / totalExpected;
  return Math.min(1.0, Math.round(adherence * 100) / 100);
}

/**
 * Calculates training load trend:
 * Compares volume of last 14 days vs prior 14-28 days
 * > 1.0 = increasing volume / progressing
 * ~ 1.0 = maintaining
 * < 1.0 = regressing or deloading
 * @param {Array<{date: Date|string, volume: number}>} sessionVolumes 
 * @returns {{ trendRatio: number, classification: string }}
 */
function calculateTrainingTrend(sessionVolumes = []) {
  const now = new Date();
  const day14 = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const day28 = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

  let recentVolume = 0;
  let priorVolume = 0;

  sessionVolumes.forEach((s) => {
    const d = new Date(s.date);
    const vol = parseFloat(s.volume) || 0;
    if (d >= day14 && d <= now) {
      recentVolume += vol;
    } else if (d >= day28 && d < day14) {
      priorVolume += vol;
    }
  });

  if (priorVolume === 0) {
    return {
      trendRatio: 1.0,
      classification: "insufficient_history",
      recentVolume,
      priorVolume,
    };
  }

  const ratio = Math.round((recentVolume / priorVolume) * 100) / 100;

  let classification = "maintaining";
  if (ratio >= 1.05) classification = "progressing";
  else if (ratio <= 0.85) classification = "regressing";

  return {
    trendRatio: ratio,
    classification,
    recentVolume,
    priorVolume,
  };
}

/**
 * Calculates average RPE over the last N workouts to detect fatigue accumulation
 * @param {Array<{avgRpe: number}>} recentWorkouts 
 * @returns {number|null}
 */
function calculateRpeTrend(recentWorkouts = []) {
  const valid = recentWorkouts
    .map((w) => w.avgRpe)
    .filter((rpe) => typeof rpe === "number" && !isNaN(rpe));

  if (valid.length === 0) return null;
  const avg = valid.reduce((sum, r) => sum + r, 0) / valid.length;
  return Math.round(avg * 10) / 10;
}

module.exports = {
  calculateVolumeLoad,
  calculateSessionMetrics,
  calculateAdherence,
  calculateTrainingTrend,
  calculateRpeTrend,
};
