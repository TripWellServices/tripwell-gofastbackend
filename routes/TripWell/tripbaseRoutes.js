const express = require("express");
const router = express.Router();
const TripBase = require("../../models/TripWell/TripBase");
const { setUserTrip } = require("../../services/TripWell/userUpdateService");
const { parseTrip } = require("../../services/TripWell/tripSetupService");

// === CREATE NEW TRIP ===
router.post("/tripbase", async (req, res) => {
  try {
    const { userId, tripName, purpose, startDate, endDate, joinCode } = req.body;

    if (!userId || !tripName || !startDate || !endDate || !purpose || !joinCode) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 1. Create and save TripBase model
    let trip = new TripBase({
      userId,
      tripName,
      purpose,
      startDate,
      endDate,
      joinCode,
    });

    await trip.save();

    // 2. Parse & enrich trip (season, destination, etc.)
    trip = parseTrip(trip);

    // 3. Update user model with tripId + originator role
    await setUserTrip(userId, trip._id);

    // ✅ Return trip._id to front end for navigation
    res.status(201).json({ tripId: trip._id });
  } catch (err) {
    console.error("❌ Trip creation failed:", err);
    res.status(500).json({ error: "Trip creation failed" });
  }
});

module.exports = router;