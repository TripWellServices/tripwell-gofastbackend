// routes/workoutRoutes.js
const express = require('express');
const router = express.Router();
const { getTodayWorkout } = require('../services/WorkoutService');
const verifyToken = require('../middleware/verifyToken');

router.get('/today', verifyToken, async (req, res) => {
  try {
    const result = await getTodayWorkout(req.user.id);
    res.json(result);
  } catch (err) {
    console.error('Error in /api/workout/today:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
