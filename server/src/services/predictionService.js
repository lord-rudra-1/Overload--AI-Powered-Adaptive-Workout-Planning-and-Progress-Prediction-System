/**
 * Progress Prediction & Forecasting Service
 * 
 * Uses statistical linear regression to model an athlete's 1RM trajectory,
 * project future gains, compute prediction uncertainty intervals,
 * and forecast the timeline to reach target strength goals.
 * 
 * Reference: Hyndman & Athanasopoulos (2021) time-series forecasting.
 */

const ss = require("simple-statistics");
const { build1RMHistory } = require("./estimator");

/**
 * Generates progress prediction and future forecast for an exercise goal
 * 
 * @param {Array<Object>} exerciseLogs - all past PerformanceLog records for this exercise
 * @param {number} targetGoalWeight - target 1RM in kg
 * @param {number} forecastWeeks - number of weeks to extrapolate (default 10)
 * 
 * @returns {Object} predictionReport
 */
function predictExerciseProgress(exerciseLogs = [], targetGoalWeight = null, forecastWeeks = 10) {
  const history = build1RMHistory(exerciseLogs);

  if (history.length === 0) {
    return {
      status: "NO_DATA",
      message: "No performance history available yet for this exercise.",
      current1RM: 0,
      history: [],
      forecast: [],
    };
  }

  const current1RM = history[history.length - 1].e1rm;

  // If fewer than 3 distinct data points, return early with baseline guidance
  if (history.length < 3) {
    return {
      status: "INSUFFICIENT_DATA",
      message: `Need at least 3 historical sessions to train regression model (currently have ${history.length}).`,
      current1RM,
      history,
      forecast: [],
      weeklyGainKg: null,
      weeksToGoal: null,
    };
  }

  // Convert dates to relative weeks from the first recorded session
  const firstDate = new Date(history[0].date).getTime();
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;

  const points = history.map((h) => {
    const timeDiff = new Date(h.date).getTime() - firstDate;
    const week = Math.max(0, timeDiff / msPerWeek);
    return [week, h.e1rm];
  });

  // Calculate linear regression: y = m*x + b
  const regressionLine = ss.linearRegression(points);
  const lineFunc = ss.linearRegressionLine(regressionLine);

  const weeklyGainKg = Math.round(regressionLine.m * 100) / 100;
  const currentWeek = points[points.length - 1][0];

  // Calculate standard error of estimate (residuals)
  const residuals = points.map(([x, y]) => y - lineFunc(x));
  const variance = residuals.reduce((sum, r) => sum + r * r, 0) / Math.max(1, points.length - 2);
  const stdError = Math.sqrt(variance);

  // Generate future forecast points with 80% prediction interval (+- 1.28 * stdError)
  const zScore = 1.28;
  const forecast = [];

  for (let w = 1; w <= forecastWeeks; w++) {
    const futureWeek = currentWeek + w;
    const predicted = Math.round(lineFunc(futureWeek) * 10) / 10;
    // Uncertainty grows with extrapolation distance (minimum 1.5kg baseline noise)
    const expansionFactor = Math.sqrt(1 + 1 / points.length + (w * w) / 10);
    const calculatedMargin = zScore * (stdError || 1.2) * expansionFactor;
    const margin = Math.round(Math.max(1.5, calculatedMargin) * 10) / 10;

    forecast.push({
      weekOffset: w,
      projectedWeek: Math.round(futureWeek * 10) / 10,
      predicted1RM: Math.max(0, predicted),
      lowerBound: Math.max(0, Math.round((predicted - margin) * 10) / 10),
      upperBound: Math.round((predicted + margin) * 10) / 10,
    });
  }

  // Determine timeline to goal
  let goalStatus = "IN_PROGRESS";
  let weeksToGoal = null;
  let estimatedCompletionDate = null;

  if (targetGoalWeight) {
    if (current1RM >= targetGoalWeight) {
      goalStatus = "ACHIEVED";
      weeksToGoal = 0;
    } else if (weeklyGainKg <= 0.05) {
      goalStatus = "PLATEAU_OR_REGRESSING";
      weeksToGoal = null; // Cannot reach under current trajectory
    } else {
      const remainingKg = targetGoalWeight - current1RM;
      weeksToGoal = Math.ceil(remainingKg / weeklyGainKg);

      const arrivalDate = new Date();
      arrivalDate.setDate(arrivalDate.getDate() + weeksToGoal * 7);
      estimatedCompletionDate = arrivalDate.toISOString().split("T")[0];
    }
  }

  // Calculate R-squared goodness of fit
  const rSquared = Math.round(ss.rSquared(points, lineFunc) * 100) / 100;

  return {
    status: "ACTIVE",
    current1RM,
    weeklyGainKg,
    rSquared,
    targetGoalWeight,
    goalStatus,
    weeksToGoal,
    estimatedCompletionDate,
    standardError: Math.round(stdError * 10) / 10,
    history,
    forecast,
  };
}

module.exports = {
  predictExerciseProgress,
};
