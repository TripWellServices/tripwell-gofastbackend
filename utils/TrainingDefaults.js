const TrainingDefaults = {
  baselineWeeklyMileage: {
    Build: 35,
    Peak: 45,
    Taper: 25,
  },

  dayTypeTemplate: {
    Monday:    { type: 'Cross Training', effort: 'none' },
    Tuesday:   { type: 'Intervals', effort: 'high' },
    Wednesday: { type: 'Easy', effort: 'recovery' },
    Thursday:  { type: 'Rest', effort: 'none' },
    Friday:    { type: 'Steady', effort: 'moderate' },
    Saturday:  { type: 'Long Run', effort: 'long' },
    Sunday:    { type: 'Rest', effort: 'none' },
  },

  trainingPaceAdjustments: {
    Easy: 90,
    Steady: 60,
    Threshold: 30,
    Intervals: 0,
    Goal: -1
  },

  weeklyRampFactor: 1.08,
  maxRamp: 10,

  longRunGrowth: [8, 10, 12, 14, 15, 16, 17, 18]
};

module.exports = TrainingDefaults;