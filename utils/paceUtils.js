const TrainingDefaults = require('./TrainingDefaults');

function formatSeconds(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.round(seconds % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}

function getPaceZonesFromAdaptive5k(adaptive5kTimeInSeconds) {
  const basePace = adaptive5kTimeInSeconds / 5; // 5K = 3.1mi
  const adjustments = TrainingDefaults.trainingPaceAdjustments;

  const zones = {};
  for (const [zone, offset] of Object.entries(adjustments)) {
    const pace = basePace + offset;
    zones[zone.toLowerCase()] = {
      pace,
      display: formatSeconds(pace)
    };
  }

  return zones;
}

module.exports = {
  getPaceZonesFromAdaptive5k,
  formatSeconds
};