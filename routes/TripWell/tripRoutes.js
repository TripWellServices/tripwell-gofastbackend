const express = require('express');
const router = express.Router();
const TripBase = require('../../models/TripWell/TripBase');
const verifyFirebaseToken = require('../../middleware/verifyFirebaseToken');

const generateTripId = () => 'trip-' + Math.random().toString(36).substring(2, 10);
const generateLocationId = () => 'loc-' + Math.random().toString(36).substring(2, 10);

// === POST /api/trips/create ===
router.post('/create', verifyFirebaseToken, async (req, res) => {
  try {
    const {
      joinCode,
      tripName,
      purpose,
      startDate,
      endDate,
      destination
    } = req.body;

    if (!joinCode || !tripName || !purpose || !startDate || !endDate || !destination) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existing = await TripBase.findOne({ joinCode });
    if (existing) {
      return res.status(409).json({ error: 'Join code already in use' });
    }

    const formattedDestinations = [{
      locationId: generateLocationId(),
      city: destination,
      startDate,
      endDate,
      notes: ""
    }];

    const newTrip = new TripBase({
      tripId: generateTripId(),
      joinCode,
      tripName,
      purpose,
      startDate,
      endDate,
      destinations: formattedDestinations
    });

    const savedTrip = await newTrip.save();
    res.status(201).json(savedTrip);
  } catch (err) {
    console.error("Trip creation failed:", err);
    res.status(500).json({
      error: 'Trip creation failed',
      reason: err.message,
      details: err.stack
    });
  }
});

module.exports = router;
