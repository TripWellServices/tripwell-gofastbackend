// routes/TripWell/tripCreatedRoute.js

const express = require("express");
const router = express.Router();
const TripBase = require("../../models/TripWell/TripBase");
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");

// Test route to verify parameter parsing
router.get("/tripcreated/test/:tripId", (req, res) => {
  console.log("🧪 Test route hit with tripId:", req.params.tripId);
  res.json({ message: "Test route working", tripId: req.params.tripId });
});

// 🔐 GET /tripwell/tripcreated/:tripId
// Description: Returns the trip by tripId from URL parameter
// Simplified - users can only reach this after creating a trip
router.get("/tripcreated/:tripId", verifyFirebaseToken, async (req, res) => {
  try {
    console.log("➡️  GET /tripwell/tripcreated/:tripId");
    const { tripId } = req.params;
    console.log("🎯 Trip ID from URL:", tripId);

    const trip = await TripBase.findById(tripId);
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

    res.set("Cache-Control", "no-store");
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
