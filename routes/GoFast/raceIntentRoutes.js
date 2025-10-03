const express = require('express');
const router = express.Router();
const verifyFirebaseToken = require('../../middleware/verifyFirebaseToken');
const RaceIntent = require('../../models/GoFast/RaceIntent');
const TrainingPlanGPTService = require('../../services/GoFast/TrainingPlanGPTService');
const TrainingPlanParserService = require('../../services/GoFast/TrainingPlanParserService');
const EmailService = require('../../services/GoFast/EmailService');

/**
 * POST /api/race-intent
 * Create a new race intent
 */
router.post('/', verifyFirebaseToken, async (req, res) => {
  try {
    const firebaseId = req.user.uid;
    const {
      raceName,
      raceType,
      raceDate,
      goalTime,
      location,
      currentWeeklyMileage,
      baseline5k,
      trainingDaysPerWeek,
      preferredLongRunDay
    } = req.body;

    // Get user from database
    const User = require('../models/GoFast/User');
    const user = await User.findOne({ firebaseId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get runner profile
    const RunnerProfile = require('../models/GoFast/RunnerProfile');
    const runnerProfile = await RunnerProfile.findOne({ userId: user._id });
    if (!runnerProfile) {
      return res.status(404).json({ error: 'Runner profile not found' });
    }

    // Create race intent
    const raceIntent = new RaceIntent({
      userId: user._id,
      runnerProfileId: runnerProfile._id,
      raceName,
      raceType,
      raceDate: new Date(raceDate),
      goalTime,
      location,
      currentWeeklyMileage,
      baseline5k,
      trainingDaysPerWeek,
      preferredLongRunDay,
      status: 'draft'
    });

    await raceIntent.save();

    res.status(201).json({
      success: true,
      raceIntent
    });

  } catch (error) {
    console.error('❌ Create race intent error:', error);
    res.status(500).json({ error: 'Failed to create race intent' });
  }
});

/**
 * POST /api/race-intent/:id/generate-plan
 * Generate training plan using GPT
 */
router.post('/:id/generate-plan', verifyFirebaseToken, async (req, res) => {
  try {
    const { id } = req.params;
    const firebaseId = req.user.uid;

    // Verify ownership
    const User = require('../models/GoFast/User');
    const user = await User.findOne({ firebaseId });
    const raceIntent = await RaceIntent.findOne({ _id: id, userId: user._id });
    
    if (!raceIntent) {
      return res.status(404).json({ error: 'Race intent not found' });
    }

    // Send "generation started" email
    try {
      const User = require('../models/GoFast/User');
      const user = await User.findById(raceIntent.userId);
      if (user && user.email) {
        await EmailService.sendRaceIntentSubmitted(
          user.email,
          raceIntent.runnerProfileId.goesBy,
          raceIntent.raceName,
          raceIntent.raceType
        );
      }
    } catch (emailError) {
      console.error('❌ Email notification failed:', emailError);
      // Don't fail the whole process for email issues
    }

    // Generate training plan with GPT
    const result = await TrainingPlanGPTService.generateTrainingPlan(id);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      message: 'Training plan generation started',
      raceIntent: result.raceIntent
    });

  } catch (error) {
    console.error('❌ Generate plan error:', error);
    res.status(500).json({ error: 'Failed to generate training plan' });
  }
});

/**
 * POST /api/race-intent/:id/parse-plan
 * Parse GPT response and create training plan
 */
router.post('/:id/parse-plan', verifyFirebaseToken, async (req, res) => {
  try {
    const { id } = req.params;
    const firebaseId = req.user.uid;

    // Verify ownership
    const User = require('../models/GoFast/User');
    const user = await User.findOne({ firebaseId });
    const raceIntent = await RaceIntent.findOne({ _id: id, userId: user._id });
    
    if (!raceIntent) {
      return res.status(404).json({ error: 'Race intent not found' });
    }

    // Parse and create training plan
    const result = await TrainingPlanParserService.parseAndCreateTrainingPlan(id);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      message: 'Training plan created successfully',
      trainingPlan: result.trainingPlan,
      totalDays: result.totalDays
    });

  } catch (error) {
    console.error('❌ Parse plan error:', error);
    res.status(500).json({ error: 'Failed to parse training plan' });
  }
});

/**
 * GET /api/race-intent/:id/status
 * Get GPT processing status
 */
router.get('/:id/status', verifyFirebaseToken, async (req, res) => {
  try {
    const { id } = req.params;
    const firebaseId = req.user.uid;

    // Verify ownership
    const User = require('../models/GoFast/User');
    const user = await User.findOne({ firebaseId });
    const raceIntent = await RaceIntent.findOne({ _id: id, userId: user._id });
    
    if (!raceIntent) {
      return res.status(404).json({ error: 'Race intent not found' });
    }

    const status = await TrainingPlanGPTService.getGPTResponse(id);

    res.json({
      success: true,
      status: status.status,
      hasResponse: !!status.response,
      error: status.error
    });

  } catch (error) {
    console.error('❌ Get status error:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

/**
 * GET /api/race-intent
 * Get user's race intents
 */
router.get('/', verifyFirebaseToken, async (req, res) => {
  try {
    const firebaseId = req.user.uid;

    // Get user from database
    const User = require('../models/GoFast/User');
    const user = await User.findOne({ firebaseId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const raceIntents = await RaceIntent.find({ userId: user._id })
      .populate('runnerProfileId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      raceIntents
    });

  } catch (error) {
    console.error('❌ Get race intents error:', error);
    res.status(500).json({ error: 'Failed to get race intents' });
  }
});

module.exports = router;
