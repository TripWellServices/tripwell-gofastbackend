const express = require('express');
const router = express.Router();
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
const RaceService = require('../services/RaceService');
const User = require('../models/User');

/**
 * POST /api/race/create
 * Create a new race
 */
router.post('/create', verifyFirebaseToken, async (req, res) => {
  try {
    const firebaseId = req.user.uid;
    
    // Get user from Firebase ID
    const user = await User.findOne({ firebaseId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const {
      raceName,
      raceType,
      raceDate,
      goalTime,
      baseline5k,
      baselineWeeklyMileage,
      location
    } = req.body;
    
    const race = await RaceService.createRace({
      userId: user._id,
      raceName,
      raceType,
      raceDate,
      goalTime,
      baseline5k,
      baselineWeeklyMileage,
      location
    });
    
    res.json(race);
  } catch (error) {
    console.error('Error creating race:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/race/active
 * Get user's active race
 */
router.get('/active', verifyFirebaseToken, async (req, res) => {
  try {
    const firebaseId = req.user.uid;
    const user = await User.findOne({ firebaseId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const race = await RaceService.getActiveRace(user._id);
    
    if (!race) {
      return res.status(404).json({ error: 'No active race found' });
    }
    
    res.json(race);
  } catch (error) {
    console.error('Error fetching active race:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/race/:raceId
 * Get race by ID
 */
router.get('/:raceId', verifyFirebaseToken, async (req, res) => {
  try {
    const { raceId } = req.params;
    const race = await RaceService.getRaceById(raceId);
    
    if (!race) {
      return res.status(404).json({ error: 'Race not found' });
    }
    
    res.json(race);
  } catch (error) {
    console.error('Error fetching race:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/race/:raceId/prediction
 * Update race prediction
 */
router.put('/:raceId/prediction', verifyFirebaseToken, async (req, res) => {
  try {
    const { raceId } = req.params;
    const { adaptive5kTime } = req.body;
    
    const race = await RaceService.updateRacePrediction(raceId, adaptive5kTime);
    res.json(race);
  } catch (error) {
    console.error('Error updating prediction:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/race/:raceId/status
 * Update race status
 */
router.put('/:raceId/status', verifyFirebaseToken, async (req, res) => {
  try {
    const { raceId } = req.params;
    const { status } = req.body;
    
    const race = await RaceService.updateRaceStatus(raceId, status);
    res.json(race);
  } catch (error) {
    console.error('Error updating race status:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/race/:raceId/result
 * Submit race result
 */
router.post('/:raceId/result', verifyFirebaseToken, async (req, res) => {
  try {
    const { raceId } = req.params;
    const resultData = req.body;
    
    const race = await RaceService.submitRaceResult(raceId, resultData);
    res.json(race);
  } catch (error) {
    console.error('Error submitting race result:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/race/user/all
 * Get all races for user
 */
router.get('/user/all', verifyFirebaseToken, async (req, res) => {
  try {
    const firebaseId = req.user.uid;
    const user = await User.findOne({ firebaseId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const races = await RaceService.getUserRaces(user._id);
    res.json(races);
  } catch (error) {
    console.error('Error fetching user races:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

