const TrainingDefaults = require('../utils/TrainingDefaults');

const format = (s) => {
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return `${m}:${sec < 10 ? '0' : ''}${sec}`;
};

const from5k = (base5kTimeSec) => {
  const adj = TrainingDefaults.trainingPaceAdjustments;
  return {
    Easy: format(base5kTimeSec + adj.Easy),
    Steady: format(base5kTimeSec + adj.Steady),
    Threshold: format(base5kTimeSec + adj.Threshold),
    Intervals: format(base5kTimeSec + adj.Intervals)
  };
};

module.exports = { from5k };
