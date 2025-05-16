const TrainingDefaults = require('../utils/TrainingDefaults');

function getWeekMileage(phase, weekIndexInPhase) {
  const base = TrainingDefaults.baselineWeeklyMileage[phase] || 30;

  if (phase === 'Build' || phase === 'Peak') {
    const ramped = Math.round(base * Math.pow(TrainingDefaults.weeklyRampFactor, weekIndexInPhase));
    return Math.min(ramped, base + TrainingDefaults.maxRamp);
  }

  // Taper stays flat
  return base;
}

module.exports = { getWeekMileage };