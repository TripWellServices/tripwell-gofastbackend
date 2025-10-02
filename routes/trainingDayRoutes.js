const express = require('express');
const router = express.Router();
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
const TrainingDayService = require('../services/TrainingDayService');
const User = require('../models/User');

/**
 * GET /api/training-day/today
 * Get today's workout
 */
router.get('/today', verifyFirebaseToken, async (req, res) => {
  try {
    const firebaseId = req.user.uid;
    const user = await User.findOne({ firebaseId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const workout = await TrainingDayService.getTodayWorkout(user._id);
    res.json(workout);
  } catch (error) {
    console.error('Error fetching today workout:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/training-day/date/:date
 * Get workout for specific date
 */
router.get('/date/:date', verifyFirebaseToken, async (req, res) => {
  try {
    const firebaseId = req.user.uid;
    const user = await User.findOne({ firebaseId });
    const { date } = req.params;
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const workout = await TrainingDayService.getWorkoutByDate(user._id, date);
    
    if (!workout) {
      return res.status(404).json({ error: 'No workout found for this date' });
    }
    
    res.json(workout);
  } catch (error) {
    console.error('Error fetching workout by date:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/training-day/week/:weekIndex
 * Get all workouts for a week
 */
router.get('/week/:weekIndex', verifyFirebaseToken, async (req, res) => {
  try {
    const firebaseId = req.user.uid;
    const user = await User.findOne({ firebaseId });
    const { weekIndex } = req.params;
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const workouts = await TrainingDayService.getWeekWorkouts(user._id, parseInt(weekIndex));
    res.json(workouts);
  } catch (error) {
    console.error('Error fetching week workouts:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/training-day/:trainingDayId/feedback
 * Submit feedback for a workout
 */
router.post('/:trainingDayId/feedback', verifyFirebaseToken, async (req, res) => {
  try {
    const { trainingDayId } = req.params;
    const feedbackData = req.body;
    
    const trainingDay = await TrainingDayService.submitWorkoutFeedback(trainingDayId, feedbackData);
    res.json(trainingDay);
  } catch (error) {
    console.error('Error submitting workout feedback:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/training-day/week/:weekIndex/summary
 * Get weekly summary
 */
router.get('/week/:weekIndex/summary', verifyFirebaseToken, async (req, res) => {
  try {
    const firebaseId = req.user.uid;
    const user = await User.findOne({ firebaseId });
    const { weekIndex } = req.params;
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const summary = await TrainingDayService.getWeeklySummary(user._id, parseInt(weekIndex));
    res.json(summary);
  } catch (error) {
    console.error('Error fetching weekly summary:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/training-day/progress
 * Get overall training progress
 */
router.get('/progress', verifyFirebaseToken, async (req, res) => {
  try {
    const firebaseId = req.user.uid;
    const user = await User.findOne({ firebaseId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const progress = await TrainingDayService.getTrainingProgress(user._id);
    res.json(progress);
  } catch (error) {
    console.error('Error fetching training progress:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/training-day/hydrate/:date
 * Manually trigger Garmin hydration for a specific date
 */
router.post('/hydrate/:date', verifyFirebaseToken, async (req, res) => {
  try {
    const firebaseId = req.user.uid;
    const user = await User.findOne({ firebaseId });
    const { date } = req.params;
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const trainingDay = await TrainingDayService.hydrateGarminData(user._id, date);
    
    if (!trainingDay) {
      return res.status(404).json({ error: 'No training day or Garmin data found for this date' });
    }
    
    res.json(trainingDay);
  } catch (error) {
    console.error('Error hydrating Garmin data:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

