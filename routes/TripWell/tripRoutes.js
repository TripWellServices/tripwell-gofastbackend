const express = require('express');
const router = express.Router();
const TripBase = require('../models/TripBase');
const User = require('../models/User');

const { isJoinCodeTaken } = require('../services/TripWell/TripRegistryService');

// CREATE TRIP
router.post('/create', async (req, res) => {
  const { tripName, purpose, city, startDate, endDate, joinCode, userId } = req.body;

  if (!tripName || !purpose || !city || !startDate || !endDate || !joinCode || !userId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const taken = await isJoinCodeTaken(joinCode);
    if (taken) {
      return res.status(409).json({ message: 'Join code already in use' });
    }

    const newTrip = await TripBase.create({
      tripName,
      purpose,
      city,
      startDate,
      endDate,
      joinCode,
      creatorId: userId,
    });

    await User.findByIdAndUpdate(userId, { tripId: newTrip._id });

    return res.status(201).json({ trip: newTrip });
  } catch (err) {
    console.error('Error creating trip:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// CHECK JOIN CODE
router.post('/check-code', async (req, res) => {
  const { joinCode } = req.body;

  if (!joinCode) {
    return res.status(400).json({ message: 'Join code is required' });
  }

  try {
    const taken = await isJoinCodeTaken(joinCode);
    if (taken) {
      return res.status(409).json({ message: 'Join code already in use' });
    }

    return res.status(200).json({ message: 'Join code is available' });
  } catch (err) {
    console.error('Join code check error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
