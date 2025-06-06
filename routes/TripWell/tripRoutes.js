const express = require("express");
const router = express.Router();
const TripBase = require("../../models/TripWell/TripBase");
const { parseTrip } = require("../../services/TripWell/tripParser");

// === CREATE NEW TRIP ===
router.post("/tripbase", async (req, res) => {
  try {
    const trip = await TripBase.create(req.body);

    // 🔥 Normalize fields
    const parsed = parseTrip(trip);
    trip.destination = parsed.destination;
    trip.dateRange = parsed.dateRange;
    trip.daysTotal = parsed.daysTotal;
    trip.season = parsed.season;

    await trip.save();

    res.status(201).json(trip);
  } catch (err) {
    console.error("❌ Trip creation failed:", err);
    res.status(500).json({ error: "Trip creation failed" });
  }
});

// === GET TRIP BY ID ===
router.get("/tripbase/:id", async (req, res) => {
  try {
    const trip = await TripBase.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: "Trip not found" });
    res.json(trip);
  } catch (err) {
    console.error("❌ Trip fetch failed:", err);
    res.status(500).json({ error: "Trip fetch failed" });
  }
});

// === GET LATEST TRIP BY USER ID ===
router.get("/user/:userId/latest", async (req, res) => {
  try {
    const trip = await TripBase.findOne({ userId: req.params.userId })
      .sort({ createdAt: -1 });

    if (!trip) return res.status(404).json({ error: "No trip found" });

    res.json(trip);
  } catch (err) {
    console.error("❌ Trip lookup failed:", err);
    res.status(500).json({ error: "Trip lookup failed" });
  }
});

module.exports = router;
