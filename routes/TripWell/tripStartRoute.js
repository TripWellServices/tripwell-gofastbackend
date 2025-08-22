const express = require("express");
const path = require("path");
const router = express.Router();

const TripBase = require(path.resolve(__dirname, "../../models/TripWell/TripBase"));
const TripWellUser = require(path.resolve(__dirname, "../../models/TripWellUser"));
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

    console.log("🔍 DEBUG - Setting trip start flag:", {
      userRole: user.role,
      tripId: tripId,
      beforeOriginator: trip.tripStartedByOriginator,
      beforeParticipant: trip.tripStartedByParticipant
    });

    if (user.role === "originator") {
      trip.tripStartedByOriginator = true;
    } else if (user.role === "participant") {
      trip.tripStartedByParticipant = true;
    }

    await trip.save();
    
    console.log("🔍 DEBUG - After setting trip start flag:", {
      afterOriginator: trip.tripStartedByOriginator,
      afterParticipant: trip.tripStartedByParticipant
    });

    res.status(200).json({
      message: "Trip start recorded",
      tripStartedByOriginator: trip.tripStartedByOriginator,
      tripStartedByParticipant: trip.tripStartedByParticipant
    });
  } catch (err) {
    console.error("🔥 Error in tripStartRoute:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
