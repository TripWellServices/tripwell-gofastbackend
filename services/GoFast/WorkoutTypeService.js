const TrainingDefaults = require('../../utils/TrainingDefaults');

function getDaySchedule(totalMileage, phase, weekGlobalIndex) {
  const template = TrainingDefaults.dayTypeTemplate;
  const longRun = TrainingDefaults.longRunGrowth[Math.min(weekGlobalIndex, TrainingDefaults.longRunGrowth.length - 1)];
  const remainingMileage = totalMileage - longRun;

  // Rough splits (excluding Mon, Thurs, Sun which are 0)
  const interval = Math.round(remainingMileage * 0.25);
  const easy = Math.round(remainingMileage * 0.20);
  const steady = Math.round(remainingMileage * 0.20);
  const adjustment = remainingMileage - (interval + easy + steady);

  return [
    { day: 'Monday', type: template.Monday.type, mileage: 0 },
    { day: 'Tuesday', type: template.Tuesday.type, mileage: interval },
    { day: 'Wednesday', type: template.Wednesday.type, mileage: easy + adjustment },
    { day: 'Thursday', type: template.Thursday.type, mileage: 0 },
    { day: 'Friday', type: template.Friday.type, mileage: steady },
    { day: 'Saturday', type: template.Saturday.type, mileage: longRun },
    { day: 'Sunday', type: template.Sunday.type, mileage: 0 }
  ];
}

module.exports = { getDaySchedule };