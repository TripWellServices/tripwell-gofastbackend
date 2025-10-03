const { buildDailyWorkout } = require("./DailyWorkoutBuilderService");
const { getLongRunMileage } = require("../../utils/LongRunUtils");
const { splitMileageAcrossDays } = require("../../utils/DailyMileageUtils");

function generateWeeklyPlan({ weekIndex, phase, weeklyMileage, current5kPace, age }) {
  const longRun = getLongRunMileage(weeklyMileage);
  const dailyMileageMap = splitMileageAcrossDays(weeklyMileage, longRun);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const days = daysOfWeek.map((day) =>
    buildDailyWorkout({
      day,
      phase,
      weekIndex,
      mileage: dailyMileageMap[day],
      current5kPace,
      age
    })
  );

  return {
    weekIndex,
    phase,
    targetMileage: weeklyMileage,
    days
  };
}

module.exports = { generateWeeklyPlan };