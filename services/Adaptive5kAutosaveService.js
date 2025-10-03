const { updateWeekPlanMetrics } = require('./WeekPlanService');
const { logAdaptive5kEntry } = require('./Adaptive5kLoggerService');
const { isFinalTrainingDay } = require('../utils/WeekCompletionUtils');
const WeekPlan = require('../models/Archive/WeekPlan-OLD');
const User = require('../models/GoFast/User');

const handleGarminWebhook = async (userId, activityDateStr) => {
  // Find current week plan
  const weekPlan = await WeekPlan.findOne({ userId }).sort({ weekIndex: -1 });
  if (!weekPlan) return;

  // Check if this activity finishes the week
  const isFinalDay = isFinalTrainingDay(activityDateStr, weekPlan);
  if (!isFinalDay) return;

  // Update metrics and log 5k snapshot
  const updatedWeek = await updateWeekPlanMetrics(userId, weekPlan.weekIndex);
  await logAdaptive5kEntry(userId, weekPlan.weekIndex, updatedWeek.adaptive5kTime);

  // Change user state
  await User.findByIdAndUpdate(userId, { state: 'ReviewFeedback' });
};

module.exports = { handleGarminWebhook };
