const express = require("express");
const router = express.Router();
const TripCurrentDays = require("../../models/TripWell/TripCurrentDays");

router.get("/tripwell/itinerary/day/:tripId/:dayIndex", async (req, res) => {
  const { tripId, dayIndex } = req.params;

  try {
    const tripDay = await TripCurrentDays.findOne({ tripId, dayIndex });
    if (!tripDay) return res.status(404).json({ error: "Trip day not found" });

    res.json(tripDay);
  } catch (err) {
    console.error("Error fetching specific trip day:", err);
    res.status(500).json({ error: "Failed to fetch trip day" });
  }
});

module.exports = router;
