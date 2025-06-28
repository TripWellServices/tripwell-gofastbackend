const express = require("express");
const router = express.Router();
const TripDay = require("../../models/TripWell/TripDay");
const tripDayGPTModifier = require("../../services/TripWell/dayGPTModifierService");

router.post("/modifyday/:tripId/:dayIndex", async (req, res) => {
  const { tripId, dayIndex } = req.params;
  const { feedback } = req.body;

  try {
    // Fetch the original day to reference existing blocks
    const tripDay = await TripDay.findOne({ tripId, dayIndex });
    if (!tripDay) return res.status(404).json({ error: "Trip day not found" });

    // Call GPT to regenerate blocks based on user feedback
    const updatedDay = await tripDayGPTModifier({
      feedback,
      dayIndex,
      previousBlocks: tripDay.blocks,
      summary: tripDay.summary
    });

    // Save new values into the existing TripDay doc
    tripDay.blocks = updatedDay.blocks;
    tripDay.summary = updatedDay.summary;
    await tripDay.save();

    res.json(tripDay);
  } catch (err) {
    console.error("Error modifying trip day:", err);
    res.status(500).json({ error: "Failed to modify trip day" });
  }
});

module.exports = router;