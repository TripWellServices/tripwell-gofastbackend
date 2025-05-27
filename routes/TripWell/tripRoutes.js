const express = require('express');
const router = express.Router();
const TripBase = require('../../models/TripWell/TripBase');

const generateTripId = () => 'trip-' + Math.random().toString(36).substring(2, 10);
const generateLocationId = () => 'loc-' + Math.random().toString(36).substring(2, 10);

// POST /api/trips
router.post('/trips', async (req, res) => {
  try {
    const {
      joinCode,
      userId,
      tripName,
      purpose,
      startDate,
      endDate,
      isMultiCity,
      destinations, // multi-city
      destination    // single-city
    } = req.body;

    const existing = await TripBase.findOne({ joinCode });
    if (existing) return res.status(409).json({ error: 'Join code already in use' });

    const tripId = generateTripId();
    let formattedDestinations = [];

    if (isMultiCity && Array.isArray(destinations)) {
      formattedDestinations = destinations.map((cityObj) => ({
        locationId: generateLocationId(),
        city: cityObj.city,
        startDate: cityObj.startDate,
        endDate: cityObj.endDate,
        notes: cityObj.notes || ""
      }));
    } else if (destination) {
      formattedDestinations = [{
        locationId: generateLocationId(),
        city: destination,
        startDate,
        endDate,
        notes: ""
      }];
    }

    const newTrip = new TripBase({
      tripId,
      joinCode,
      tripName,
      users: [userId], // ✅ Shared trip model
      purpose,
      startDate,
      endDate,
      isMultiCity,
      destinations: formattedDestinations
    });

    const savedTrip = await newTrip.save();
    res.status(201).json(savedTrip);
  } catch (err) {
    console.error("Trip creation failed:", err);
    res.status(500).json({ error: 'Failed to create trip' });
  }
});

// GET /api/trips/by-user/:userId
router.get('/trips/by-user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const trips = await TripBase.find({ users: userId });
    res.json(trips);
  } catch (err) {
    console.error("Fetching trips failed:", err);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

// POST /api/trips/join
router.post('/trips/join', async (req, res) => {
  const { joinCode, userId } = req.body;

  try {
    const trip = await TripBase.findOne({ joinCode });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    if (!trip.users.includes(userId)) {
      trip.users.push(userId);
      await trip.save();
    }

    res.status(200).json({ tripId: trip.tripId });
  } catch (err) {
    console.error("Join trip failed:", err);
    res.status(500).json({ error: 'Server error while joining trip' });
  }
});

module.exports = router; // ✅ Final export
