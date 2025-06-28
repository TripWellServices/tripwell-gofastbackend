const express = require("express");
const router = express.Router();
const TripDay = require("../../models/TripWell/TripDay");

// 🎯 Fetch a specific TripDay to prefill for GPT-based day modification
router.get("/tripwell/modifyday/:tripId/:dayIndex", async (req, res) => {
  const { tripId, dayIndex } = req.params;

  try {
    const tripDay = await TripDay.findOne({ tripId, dayIndex });

    if (!tripDay) {
      return res.status(404).json({ error: "Trip day not found" });
    }

    res.json(tripDay);
  } catch (err) {
    console.error("Error fetching trip day for modifier:", err);
    res.status(500).json({ error: "Failed to retrieve trip day" });
  }
});

module.exports = router;
