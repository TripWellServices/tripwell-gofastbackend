const TrainingPlanService = require('../services/GoFast/TrainingPlanGeneratorService');

const createTrainingPlan = async (req, res) => {
  try {
    const { userId, planData } = req.body; // planData = [{ weekNumber, workouts }]
    const plan = await TrainingPlanService.createTrainingPlan(userId, planData);
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const confirmTrainingPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const plan = await TrainingPlanService.confirmTrainingPlan(planId);
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTrainingPlan, confirmTrainingPlan };
