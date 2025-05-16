function splitMileageAcrossDays(weeklyMileage, longRunMileage) {
  const restDays = ["Monday", "Friday"];
  const trainingDays = ["Tuesday", "Wednesday", "Thursday", "Saturday", "Sunday"];
  const remaining = weeklyMileage - longRunMileage;
  const perDay = Math.round(remaining / (trainingDays.length - 1));

  return {
    Monday: 0,
    Tuesday: perDay,
    Wednesday: perDay,
    Thursday: perDay,
    Friday: 0,
    Saturday: longRunMileage,
    Sunday: perDay
  };
}

module.exports = { splitMileageAcrossDays };