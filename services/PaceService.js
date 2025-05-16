const TrainingDefaults = require('../utils/TrainingDefaults');

function convertTimeToSeconds(timeStr) {
  const [min, sec] = timeStr.split(':').map(Number);
  return (min * 60) + sec;
}

function formatSeconds(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.round(seconds % 60);
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function getTrainingPaces(raceGoal, currentFitness) {
  const current5k = convertTimeToSeconds(currentFitness.current5kTime);
  const goalPace = convertTimeToSeconds(raceGoal.goalTime);

  return {
    Easy: formatSeconds(current5k + TrainingDefaults.trainingPaceAdjustments.Easy),
    Steady: formatSeconds(current5k + TrainingDefaults.trainingPaceAdjustments.Steady),
    Threshold: formatSeconds(current5k + TrainingDefaults.trainingPaceAdjustments.Threshold),
    Intervals: formatSeconds(current5k + TrainingDefaults.trainingPaceAdjustments.Intervals),
    Goal: formatSeconds(goalPace)
  };
}

module.exports = { getTrainingPaces };