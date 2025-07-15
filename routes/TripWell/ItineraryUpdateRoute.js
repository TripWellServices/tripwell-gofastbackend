const express = require("express");
const router = express.Router();
const TripDay = require("../../models/TripWell/TripDay");

// Canonical route to hydrate entire itinerary from TripDay model
router.get("/tripwell/itinerary/days/:tripId", async (req, res) => {
  const { tripId } = req.params;

  try {
    const days = await TripDay.find({ tripId }).sort({ dayIndex: 1 });

    if (!days || days.length === 0) {
      return res.status(404).json({ error: "No itinerary days found." });
    }

    res.status(200).json(days);
  } catch (err) {
    console.error("Error fetching itinerary days:", err);
    res.status(500).json({ error: "Failed to fetch itinerary days." });
  }
});

module.exports = router;
