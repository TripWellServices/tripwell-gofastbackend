const express = require("express");
const router = express.Router();
const TripDay = require("../../models/TripWell/TripDay");
const tripDayGPTModifier = require("../../services/TripWell/dayGPTModifierService");

router.post("/tripwell/modifygpt/day", async (req, res) => {
  const { tripId, dayIndex, feedback } = req.body;

  try {
    const tripDay = await TripDay.findOne({ tripId, dayIndex });
    if (!tripDay) return res.status(404).json({ error: "Trip day not found" });

    const updatedDay = await tripDayGPTModifier({
      feedback,
      dayIndex,
      previousBlocks: tripDay.blocks,
      summary: tripDay.summary
    });

    // 🧠 Don't save — just return it for preview
    res.json(updatedDay);
  } catch (err) {
    console.error("Error modifying trip day with GPT:", err);
    res.status(500).json({ error: "Failed to generate modified trip day" });
  }
});

module.exports = router;
