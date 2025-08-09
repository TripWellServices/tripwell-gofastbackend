// routes/TripWell/tripbaseRoutes.js
const express = require("express");
const router = express.Router();

const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");
const User = require("../../models/User");
const TripBase = require("../../models/TripWell/TripBase");
const { setUserTrip } = require("../../services/TripWell/userTripService");
const { parseTrip } = require("../../services/TripWell/tripSetupService");

// POST /tripwell/tripbase  (mounted in index.js)
router.post("/", verifyFirebaseToken, async (req, res) => {
  try {
    console.log("➡️  POST /tripwell/tripbase");
    console.log("📥 body:", req.body);

    const firebaseId = req.user?.uid;
    if (!firebaseId) return res.status(401).json({ error: "Unauthorized" });

    const {
      tripName, purpose, startDate, endDate,
      joinCode, whoWith, partyCount, city
    } = req.body;

    // Required fields — purpose added
    const missing = [];
    if (!tripName) missing.push("tripName");
    if (!purpose) missing.push("purpose");
    if (!startDate) missing.push("startDate");
    if (!endDate) missing.push("endDate");
    if (!city) missing.push("city");
    if (missing.length) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
    }

    // Date sanity
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ error: "startDate must be on/before endDate" });
    }

    const user = await User.findOne({ firebaseId });
    if (!user) return res.status(404).json({ error: "User not found" });

    let trip = new TripBase({
      userId: user._id,
      tripName, purpose, startDate, endDate,
      joinCode, whoWith, partyCount, city
    });

    try {
      await trip.save();
    } catch (err) {
      if (err.code === 11000 && err.keyPattern?.joinCode) {
        return res.status(409).json({ error: "Join code already taken" });
      }
      throw err;
    }

    trip = parseTrip(trip);
    await setUserTrip(user._id, trip._id);

    console.log("✅ Trip created:", String(trip._id));
    return res.status(201).json({ tripId: trip._id });
  } catch (err) {
    console.error("❌ Trip creation failed:", err);
    return res.status(500).json({ error: "Trip creation failed" });
  }
});

module.exports = router;
