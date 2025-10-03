const Activity = require('../../models/Archive/Activity-OLD');

const logActivity = async (userId, activityData) => {
  return await Activity.create({ userId, ...activityData });
};

const getActivitiesForUser = async (userId) => {
  return await Activity.find({ userId }).sort({ activityDate: -1 });
};

module.exports = { logActivity, getActivitiesForUser };
