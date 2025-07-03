const express = require("express");
const router = express.Router();
const { createTripBaseWithMetadata } = require("../../services/TripWell/tripSetupService");
const TripBase = require("../../models/TripWell/TripBase");
const User = require("../../models/User"); // ⬅️ Ensure this path is correct

// === CREATE NEW TRIP ===
router.post("/tripbase", async (req, res) => {
  try {
    const userId = req.body.userId;
    const tripData = req.body;

    // 1. Create the trip
    const trip = await createTripBaseWithMetadata({ userId, tripData });

    // 2. Assign tripId + originator role to user
    await User.findOneAndUpdate(
      { userId }, // Firebase UID
      {
        tripId: trip._id,
        role: "originator",
      },
      { new: true }
    );

    res.status(201).json({ trip });
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
