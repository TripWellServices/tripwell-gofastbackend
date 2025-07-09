const express = require("express");
const router = express.Router();
const TripBase = require("../../models/TripWell/TripBase");

// PATCH /tripwell/starttrip/:tripId
router.patch("/starttrip/:tripId", async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await TripBase.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    trip.tripStarted = true;
    await trip.save();

    res.status(200).json({
      message: "Trip successfully started",
      tripId: trip._id,
      tripStarted: true
    });
  } catch (err) {
    console.error("❌ starttrip error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;