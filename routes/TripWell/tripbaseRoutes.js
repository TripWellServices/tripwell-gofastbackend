const express = require("express");
const router = express.Router();
const TripBase = require("../../models/TripWell/TripBase");
const { setUserTrip } = require("../../services/TripWell/userUpdateService");
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
    partyCount
  } = req.body;

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
      partyCount
    });

    await trip.save();
    trip = parseTrip(trip);

    await setUserTrip(user._id, trip._id);

    res.status(201).json({ tripId: trip._id });
  } catch (err) {
    console.error("❌ Trip creation failed:", err);
    res.status(500).json({ error: "Trip creation failed" });
  }
});

module.exports = router;
