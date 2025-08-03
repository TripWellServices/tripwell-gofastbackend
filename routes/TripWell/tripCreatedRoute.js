// routes/TripWell/tripCreatedRoute.js

const express = require("express");
const router = express.Router();
const TripBase = require("../../models/TripWell/TripBase");
const TripWellUser = require("../../models/TripWell/TripWellUser");
const { verifyFirebaseToken } = require("../../middleware/authMiddleware");

// 🔐 GET /tripwell/tripcreated
// Description: Returns the current user's trip based on Firebase auth
router.get("/tripcreated", verifyFirebaseToken, async (req, res) => {
  try {
    const firebaseId = req.user.uid;

    const user = await TripWellUser.findOne({ firebaseId });
    if (!user || !user.tripId) {
      return res.status(404).json({ error: "No trip found for user" });
    }

    const trip = await TripBase.findById(user.tripId);
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    const {
      tripName,
      purpose,
      startDate,
      endDate,
      joinCode,
      whoWith,
      partyCount,
      city,
    } = trip;

    return res.status(200).json({
      trip: {
        tripId: trip._id,
        tripName,
        purpose,
        startDate,
        endDate,
        joinCode,
        whoWith,
        partyCount,
        city,
      },
    });
  } catch (err) {
    console.error("❌ tripcreated lookup failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
