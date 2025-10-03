const GarminActivity = require('../../models/GarminActivity');
const { getWeekRangeFromIndex } = require('../utils/DateUtils');
const { scoreRun } = require('./runScoringService');
const WeekPlan = require('../../models/WeekPlan');

const aggregateWeeklyEffort = async (userId, weekIndex) => {
  const { startDate, endDate } = getWeekRangeFromIndex(weekIndex);
  const activities = await GarminActivity.find({
    userId,
    activityDate: { $gte: startDate, $lte: endDate }
  });

  const weekPlan = await WeekPlan.findOne({ userId, weekIndex });
  if (!weekPlan) return null;

  let totalMiles = 0;
  let totalScore = 0;

  for (const activity of activities) {
    const dayName = new Date(activity.activityDate).toLocaleDateString('en-US', { weekday: 'long' });
    const plannedWorkout = weekPlan.plannedWorkouts.find(p => p.day === dayName);
    const result = scoreRun(activity, plannedWorkout);

    if (result) {
      totalMiles += result.mileage;
      totalScore += result.score * result.mileage;
    }
  }

  const efficiencyScore = totalMiles > 0 ? totalScore / totalMiles : 0;

  return {
    totalMiles,
    adaptiveMiles: totalScore,
    efficiencyScore
  };
};

module.exports = { aggregateWeeklyEffort };
