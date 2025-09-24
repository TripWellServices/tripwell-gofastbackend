const express = require("express");
const path = require("path");
const router = express.Router();

const TripBase = require(path.resolve(__dirname, "../../models/TripWell/TripBase"));
const TripWellUser = require(path.resolve(__dirname, "../../models/TripWellUser"));
const { startTrip } = require("../../services/startTripService");
const verifyFirebaseToken = require(path.resolve(__dirname, "../../middleware/verifyFirebaseToken"));

// POST /tripwell/starttrip/:tripId
router.post("/starttrip/:tripId", verifyFirebaseToken, async (req, res) => {
  const { tripId } = req.params;
  const firebaseId = req.user.uid;

  try {
    const user = await TripWellUser.findOne({ firebaseId });
    if (!user) return res.status(404).json({ error: "User not found" });

    const trip = await TripBase.findById(tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    console.log("🔍 DEBUG - Starting trip with service:", {
      userRole: user.role,
      tripId: tripId,
      userId: user._id
    });

    // 🚀 Use service to start trip (duplicates ItineraryDays → TripCurrentDays)
    const tripCurrentDays = await startTrip(tripId, user._id);
    
    console.log("✅ Trip started successfully with service");

    res.status(200).json({
      message: "Trip started successfully",
      tripCurrentDays: tripCurrentDays,
      tripStartedAt: tripCurrentDays.tripStartedAt
    });
  } catch (err) {
    console.error("🔥 Error in tripStartRoute:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
