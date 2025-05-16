const workoutToHRZone = {
  'Long Run': 'Z2',
  'Easy': 'Z1',
  'Threshold': 'Z3',
  'Intervals': 'Z4',
  'Steady': 'Z2',
  'Cross Training': null, // skip scoring
  'Rest': null
};

const getTargetHRZone = (workoutType) => workoutToHRZone[workoutType] || null;

module.exports = { getTargetHRZone };
