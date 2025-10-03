const GoalProfile = require('../../models/Archive/GoalProfile-OLD');

const createGoalProfile = async (userId, goalData) => {
  return await GoalProfile.create({ userId, ...goalData });
};

const getGoalProfileByUser = async (userId) => {
  return await GoalProfile.findOne({ userId });
};

module.exports = { createGoalProfile, getGoalProfileByUser };
