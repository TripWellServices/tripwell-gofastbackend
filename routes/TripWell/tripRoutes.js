const express = require('express');
const router = express.Router();
const TripBase = require('../../models/TripWell/TripBase');

const generateTripId = () => 'trip-' + Math.random().toString(36).substring(2, 10);
const generateLocationId = () => 'loc-' + Math.random().toString(36).substring(2, 10);

// === POST /api/trips/create ===
router.post('/create', async (req, res) => {
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
      users: [userId], // associate creating user
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

// Keep your other routes as they are...

module.exports = router;
