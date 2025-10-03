const GarminActivity = require("../models/Archive/GarminActivity-OLD");
const TrainingPlan = require("../models/GoFast/TrainingPlan");

const getDisplayDailyActivity = async (userId, dateOverride = null) => {
  const today = dateOverride || new Date().toISOString().split("T")[0];

  // Fetch completed activity
  const completedActivity = await GarminActivity.findOne({
    userId,
    activityDate: today
  });

  // Fetch planned workout
  const plan = await TrainingPlan.findOne({ userId });
  if (!plan) return { error: "No training plan found" };

  const totalDays = Math.floor((new Date(today) - new Date(plan.startDate)) / (1000 * 60 * 60 * 24));
  const weekIndex = Math.floor(totalDays / 7);
  const dayIndex = totalDays % 7;

  const plannedWorkout = plan.weeks?.[weekIndex]?.days?.[dayIndex] || null;

  // Determine status
  let status = "incomplete";
  if (plannedWorkout?.mileage === 0) {
    status = "rest";
  } else if (completedActivity) {
    status = "complete";
  }

  return {
    date: today,
    status,
    plannedWorkout,
    completedActivity
  };
};

module.exports = { getDisplayDailyActivity };
