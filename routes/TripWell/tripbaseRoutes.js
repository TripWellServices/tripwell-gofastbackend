const express = require("express");
const router = express.Router();
const TripBase = require("../../models/TripWell/TripBase");
const { setUserTrip } = require("../../services/TripWell/userTripService");
const { parseTrip } = require("../../services/TripWell/tripSetupService");
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");
const User = require("../../models/User");

// POST /tripwell/tripbase
router.post("/tripbase", verifyFirebaseToken, async (req, res) => {
  const firebaseId = req.user.uid;
  const {
    tripName,
    purpose,
    startDate,
    endDate,
    joinCode,
    whoWith,
    partyCount,
    city, // ✅ Required now
  } = req.body;

  if (!city) {
    return res.status(400).json({ error: "City is required" });
  }

  try {
    const user = await User.findOne({ firebaseId });
    if (!user) return res.status(404).json({ error: "User not found" });

    let trip = new TripBase({
      userId: user._id,
      tripName,
      purpose,
      startDate,
      endDate,
      joinCode,
      whoWith,
      partyCount,
      city, // ✅ Store the real value now
    });

    await trip.save();

    // 🔄 Enrich trip metadata (season, daysTotal, etc.)
    trip = parseTrip(trip);

    // 🔗 Attach trip to user + set role
    await setUserTrip(user._id, trip._id);

    // ✅ Return trip ID to frontend
    res.status(201).json({ tripId: trip._id });
  } catch (err) {
    console.error("❌ Trip creation failed:", err);
    res.status(500).json({ error: "Trip creation failed" });
  }
});

module.exports = router;
