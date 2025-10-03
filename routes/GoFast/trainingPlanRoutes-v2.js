const express = require('express');
const router = express.Router();
const verifyFirebaseToken = require('../../middleware/verifyFirebaseToken');
const TrainingPlanGeneratorService = require('../../services/GoFast/TrainingPlanGeneratorService');
const User = require('../../models/GoFast/User');

/**
 * POST /api/training-plan/generate/:raceId
 * Generate training plan for a race
 */
router.post('/generate/:raceId', verifyFirebaseToken, async (req, res) => {
  try {
    const { raceId } = req.params;
    const { userAge } = req.body;  // Optional: default to 30 if not provided
    
    const result = await TrainingPlanGeneratorService.generateTrainingPlan(
      raceId,
      userAge || 30
    );
    
    res.json({
      message: 'Training plan generated successfully',
      plan: result.plan,
      totalWeeks: result.totalWeeks,
      totalDays: result.totalDays
    });
  } catch (error) {
    console.error('Error generating training plan:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/training-plan/:planId/activate
 * Activate a training plan (accept and start)
 */
router.put('/:planId/activate', verifyFirebaseToken, async (req, res) => {
  try {
    const { planId } = req.params;
    
    const plan = await TrainingPlanGeneratorService.activateTrainingPlan(planId);
    
    res.json({
      message: 'Training plan activated successfully',
      plan
    });
  } catch (error) {
    console.error('Error activating training plan:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/training-plan/race/:raceId
 * Get training plan for a race
 */
router.get('/race/:raceId', verifyFirebaseToken, async (req, res) => {
  try {
    const { raceId } = req.params;
    
    const plan = await TrainingPlanGeneratorService.getTrainingPlan(raceId);
    
    if (!plan) {
      return res.status(404).json({ error: 'Training plan not found' });
    }
    
    res.json(plan);
  } catch (error) {
    console.error('Error fetching training plan:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/training-plan/active
 * Get user's active training plan
 */
router.get('/active', verifyFirebaseToken, async (req, res) => {
  try {
    const firebaseId = req.user.uid;
    const user = await User.findOne({ firebaseId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { TrainingPlan } = require('../models/TrainingPlan');
    const plan = await TrainingPlan.findOne({ 
      userId: user._id,
      status: 'active'
    })
      .populate('raceId')
      .populate({
        path: 'weeks.dayIds',
        model: 'TrainingDay'
      });
    
    if (!plan) {
      return res.status(404).json({ error: 'No active training plan found' });
    }
    
    res.json(plan);
  } catch (error) {
    console.error('Error fetching active training plan:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

