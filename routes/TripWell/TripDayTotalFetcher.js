const express = require("express");
const router = express.Router();
const TripBase = require("../../models/TripWell/TripBase");

// 📦 Return tripName and totalDays from TripBase
router.get("/tripwell/tripdaytotal/:tripId", async (req, res) => {
  const { tripId } = req.params;

  try {
    const trip = await TripBase.findById(tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    res.json({
      tripName: trip.tripName,
      totalDays: trip.totalDays
    });
  } catch (err) {
    console.error("Error fetching total days:", err);
    res.status(500).json({ error: "Failed to fetch trip day total" });
  }
});

module.exports = router;
