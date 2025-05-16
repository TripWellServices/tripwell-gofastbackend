const GoalProfileService = require('../services/GoalProfileService');

const createGoalProfile = async (req, res) => {
  try {
    const { userId, goalRaceDistance, goalRaceDate, targetFinishTime, targetPace } = req.body;
    const goalProfile = await GoalProfileService.createGoalProfile(userId, { goalRaceDistance, goalRaceDate, targetFinishTime, targetPace });
    res.json(goalProfile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getGoalProfileByUser = async (req, res) => {
  try {
    const goalProfile = await GoalProfileService.getGoalProfileByUser(req.params.userId);
    res.json(goalProfile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createGoalProfile, getGoalProfileByUser };
