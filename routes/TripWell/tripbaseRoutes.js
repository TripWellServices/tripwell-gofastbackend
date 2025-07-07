const express = require("express");
const router = express.Router();
const TripBase = require("../../models/TripWell/TripBase");
const { parseTrip } = require("../../services/TripWell/tripSetupService");
const { setUserTrip } = require("../../services/TripWell/userTripService");

router.post("/tripbase", async (req, res) => {
  try {
    const { userId, tripName, purpose, startDate, endDate, joinCode } = req.body;

    // 1. Validate required fields
    if (!userId || !tripName || !purpose || !startDate || !endDate || !joinCode) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // 2. Create base trip
    const trip = await new TripBase({
      userId,
      tripName,
      purpose,
      startDate,
      endDate,
      joinCode,
    }).save();

    // 3. Enrich with canonical parser (city, season, duration, etc.)
    const enriched = parseTrip(trip);
    await TripBase.findByIdAndUpdate(trip._id, enriched);

    // 4. Link to user
    await setUserTrip(userId, trip._id);

    // 5. Return enriched trip
    res.status(201).json({ trip: enriched });

  } catch (err) {
    console.error("❌ Trip creation failed:", err);
    res.status(500).json({ error: "Trip creation failed" });
  }
});
