// routes/trainingbase.js
const express = require('express');
const router = express.Router();
const TrainingBase = require('../models/TrainingBase');

router.post('/current-capability', async (req, res) => {
  try {
    const { userId, current5kTime, weeklyMileage, lastRace } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    // Find existing or create a new TrainingBase for this user
    const base = await TrainingBase.findOneAndUpdate(
      { userId },
      {
        $set: {
          currentFitness: {
            current5kTime,
            weeklyMileage,
            lastRace,
          },
        },
      },
      { upsert: true, new: true }
    );

    console.log("✅ Current fitness saved:", base.currentFitness);
    res.status(200).json({ message: 'Current capability saved', base });
  } catch (err) {
    console.error("❌ Error saving current capability:", err);
    res.status(500).json({ error: 'Server error saving current capability' });
  }
});

module.exports = router;
