/**
 * One-Repetition Maximum (1RM) Estimator
 * 
 * Uses the validated Epley formula:
 * 1RM = weight * (1 + repetitions / 30)
 * 
 * Reference from project proposal:
 * Epley (1985) / Brzycki (1993)
 */

/**
 * Calculates estimated 1RM for a single set using the Epley formula
 * @param {number} weight - weight in kg
 * @param {number} reps - repetitions completed
 * @returns {number} estimated 1RM in kg rounded to 1 decimal place
 */
function calculateEpley1RM(weight, reps) {
  const w = parseFloat(weight) || 0;
  const r = parseInt(reps, 10) || 0;

  if (w <= 0 || r <= 0) return 0;
  if (r === 1) return Math.round(w * 10) / 10;

  // Epley formula: 1RM = w * (1 + r / 30)
  const e1rm = w * (1 + r / 30);
  return Math.round(e1rm * 10) / 10;
}

/**
 * Extracts the peak estimated 1RM from an array of logged sets for a workout/session
 * @param {Array<{weight: number, repetitions: number}>} sets 
 * @returns {number}
 */
function getPeakSession1RM(sets = []) {
  if (!Array.isArray(sets) || sets.length === 0) return 0;
  let max1RM = 0;

  for (const s of sets) {
    const e1rm = calculateEpley1RM(s.weight, s.repetitions);
    if (e1rm > max1RM) {
      max1RM = e1rm;
    }
  }

  return max1RM;
}

/**
 * Builds chronological 1RM progression curve from performance logs
 * @param {Array<{date: Date|string, weight: number, repetitions: number}>} logs 
 * @returns {Array<{date: string, e1rm: number, weight: number, reps: number}>}
 */
function build1RMHistory(logs = []) {
  if (!Array.isArray(logs) || logs.length === 0) return [];

  // Group by date (YYYY-MM-DD)
  const dateMap = {};

  logs.forEach((log) => {
    const dateStr = new Date(log.date).toISOString().split("T")[0];
    const e1rm = calculateEpley1RM(log.weight, log.repetitions);

    if (!dateMap[dateStr] || e1rm > dateMap[dateStr].e1rm) {
      dateMap[dateStr] = {
        date: dateStr,
        e1rm,
        weight: log.weight,
        reps: log.repetitions,
      };
    }
  });

  return Object.values(dateMap).sort((a, b) => new Date(a.date) - new Date(b.date));
}

module.exports = {
  calculateEpley1RM,
  getPeakSession1RM,
  build1RMHistory,
};
