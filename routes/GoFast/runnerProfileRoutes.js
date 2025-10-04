const express = require('express');
const router = express.Router();
const RunnerProfile = require('../../models/GoFast/RunnerProfile');
const User = require('../../models/GoFast/User');
const verifyFirebaseToken = require('../../middleware/verifyFirebaseToken');

/**
 * PUT /api/users/profile
 * Update or create runner profile
 */
router.put('/profile', verifyFirebaseToken, async (req, res) => {
  try {
    const firebaseId = req.user.uid;
    const { name, goesBy, age, city, averagePace, weeklyMileage } = req.body;

    console.log('🏃 Updating runner profile for:', firebaseId);

    // Find the user
    const user = await User.findOne({ firebaseId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if profile already exists
    let runnerProfile = await RunnerProfile.findOne({ userId: user._id });

    if (runnerProfile) {
      // Update existing profile
      runnerProfile.name = name;
      runnerProfile.goesBy = goesBy;
      runnerProfile.age = age;
      runnerProfile.city = city;
      runnerProfile.averagePace = averagePace;
      runnerProfile.weeklyMileage = weeklyMileage;
      runnerProfile.updatedAt = new Date();
      
      await runnerProfile.save();
      console.log('✅ Runner profile updated');
    } else {
      // Create new profile
      runnerProfile = new RunnerProfile({
        userId: user._id,
        name,
        goesBy,
        age,
        city,
        averagePace,
        weeklyMileage
      });
      
      await runnerProfile.save();
      console.log('✅ Runner profile created');
    }

    res.json(runnerProfile);
  } catch (error) {
    console.error('❌ Runner profile update error:', error);
    res.status(500).json({ error: 'Failed to update runner profile' });
  }
});

/**
 * GET /api/users/profile
 * Get runner profile
 */
router.get('/profile', verifyFirebaseToken, async (req, res) => {
  try {
    const firebaseId = req.user.uid;

    // Find the user
    const user = await User.findOne({ firebaseId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the profile
    const runnerProfile = await RunnerProfile.findOne({ userId: user._id });
    if (!runnerProfile) {
      return res.status(404).json({ error: 'Runner profile not found' });
    }

    res.json(runnerProfile);
  } catch (error) {
    console.error('❌ Runner profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch runner profile' });
  }
});

module.exports = router;
