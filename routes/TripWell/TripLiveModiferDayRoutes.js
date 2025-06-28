const express = require("express");
const router = express.Router();
const TripDay = require("../../models/TripWell/TripDay");
const tripDayGPTModifier = require("../../services/TripWell/dayGPTModifierService");

// 🎯 Live Trip Modification Route (real-time editing during trip)
router.post("/tripwell/live/modifyday/:tripId/:dayIndex", async (req, res) => {
  const { tripId, dayIndex } = req.params;
  const { feedback } = req.body;

  try {
    const dayIndexNum = parseInt(dayIndex, 10);
    if (isNaN(dayIndexNum)) {
      return res.status(400).json({ error: "Invalid day index" });
    }

    const tripDay = await TripDay.findOne({ tripId, dayIndex: dayIndexNum });
    if (!tripDay) {
      return res.status(404).json({ error: "Trip day not found" });
    }

    const updatedDay = await tripDayGPTModifier({
      tripId,
      dayIndex: dayIndexNum,
      feedback,
      summary: tripDay.summary,
      previousBlocks: tripDay.blocks,
    });

    tripDay.summary = updatedDay.summary;
    tripDay.blocks = updatedDay.blocks;
    await tripDay.save();

    res.status(200).json(tripDay);
  } catch (err) {
    console.error("🛑 TripLive Day Modification Error:", err);
    res.status(500).json({ error: "Failed to modify live trip day" });
  }
});

module.exports = router;
