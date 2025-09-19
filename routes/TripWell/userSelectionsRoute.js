const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../../middleware/verifyFirebaseToken');
const { 
  saveMetaSelections, 
  saveSampleSelections, 
  getUserSelections,
  getUserBehaviorPatterns 
} = require('../../services/TripWell/userSelectionsService');

/**
 * POST /tripwell/user-selections/meta
 * Save user's selected meta attractions
 */
router.post('/user-selections/meta', verifyFirebaseToken, async (req, res) => {
  try {
    const { tripId, selectedMetaNames } = req.body;
    const userId = req.user.uid;
    
    if (!tripId || !selectedMetaNames) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: tripId, selectedMetaNames'
      });
    }
    
    const result = await saveMetaSelections(tripId, userId, selectedMetaNames);
    
    res.json({
      status: 'success',
      message: 'Meta selections saved',
      selections: result.selectedMetas,
      behaviorData: result.behaviorData
    });
    
  } catch (error) {
    console.error('❌ Error saving meta selections:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * POST /tripwell/user-selections/samples
 * Save user's selected samples
 */
router.post('/user-selections/samples', verifyFirebaseToken, async (req, res) => {
  try {
    const { tripId, selectedSamples } = req.body;
    const userId = req.user.uid;
    
    if (!tripId || !selectedSamples) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: tripId, selectedSamples'
      });
    }
    
    const result = await saveSampleSelections(tripId, userId, selectedSamples);
    
    res.json({
      status: 'success',
      message: 'Sample selections saved',
      selections: result.selectedSamples,
      behaviorData: result.behaviorData
    });
    
  } catch (error) {
    console.error('❌ Error saving sample selections:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * GET /tripwell/user-selections/:tripId
 * Get user's selections for a specific trip
 */
router.get('/user-selections/:tripId', verifyFirebaseToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.uid;
    
    const selections = await getUserSelections(tripId, userId);
    
    res.json({
      status: 'success',
      selections
    });
    
  } catch (error) {
    console.error('❌ Error getting user selections:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * GET /tripwell/user-behavior/:userId
 * Get user's behavior patterns for prediction
 */
router.get('/user-behavior/:userId', verifyFirebaseToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const behaviorPatterns = await getUserBehaviorPatterns(userId);
    
    res.json({
      status: 'success',
      behaviorPatterns
    });
    
  } catch (error) {
    console.error('❌ Error getting behavior patterns:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
