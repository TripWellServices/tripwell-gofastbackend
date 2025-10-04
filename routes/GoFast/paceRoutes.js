const express = require('express');
const router = express.Router();
const { from5k } = require('../../services/paceZoneService');
const { getTrainingPaces } = require('../../services/PaceService');

/**
 * POST /api/pace/convert-5k
 * Convert 5K time to training paces
 */
router.post('/convert-5k', async (req, res) => {
  try {
    const { baseline5k } = req.body;
    
    if (!baseline5k) {
      return res.status(400).json({ error: 'baseline5k is required' });
    }

    // Convert 5K time to seconds
    const [min, sec] = baseline5k.split(':').map(Number);
    const baseline5kSeconds = (min * 60) + sec;

    // Get training paces
    const trainingPaces = from5k(baseline5kSeconds);

    res.json({
      baseline5k,
      baseline5kSeconds,
      trainingPaces
    });

  } catch (error) {
    console.error('Pace conversion error:', error);
    res.status(500).json({ error: 'Failed to convert 5K time' });
  }
});

/**
 * POST /api/pace/training-paces
 * Get training paces for race goal and current fitness
 */
router.post('/training-paces', async (req, res) => {
  try {
    const { raceGoal, currentFitness } = req.body;
    
    if (!raceGoal || !currentFitness) {
      return res.status(400).json({ error: 'raceGoal and currentFitness are required' });
    }

    const trainingPaces = getTrainingPaces(raceGoal, currentFitness);

    res.json({
      trainingPaces
    });

  } catch (error) {
    console.error('Training paces error:', error);
    res.status(500).json({ error: 'Failed to calculate training paces' });
  }
});

module.exports = router;
