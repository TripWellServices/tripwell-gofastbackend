// routes/TripWell/modifierDayGPTRoute.js

const express = require("express");
const router = express.Router();

// Canonical services for modifying a trip day
const TripDay = require("../../models/TripWell/TripDay");
const tripDayGPTModifier = require("../../services/TripWell/tripDayGPTModifier"); // GPT-only
const { saveParsedDayModification } = require("../../services/TripWell/singleDayModifyfromParseSaver");
const { parseSingleDayModify } = require("../../services/TripWell/parseSingleDayModify");

router.post("/tripwell/modifygpt/day", async (req, res) => {
  const { tripId, dayIndex, feedback } = req.body;

  if (!tripId || typeof dayIndex !== "number" || !feedback) {
    return res.status(400).json({ error: "Missing tripId, dayIndex, or feedback" });
  }

  try {
    // Fetch original TripDay content
    const tripDay = await TripDay.findOne({ tripId, dayIndex });
    if (!tripDay) return res.status(404).json({ error: "Trip day not found" });

    // Call GPT to get revised day
    const gptOutput = await tripDayGPTModifier({
      feedback,
      dayIndex,
      previousBlocks: tripDay.blocks,
      summary: tripDay.summary
    });

    // Parse (optional, but safe)
    const parsed = parseSingleDayModify(gptOutput);

    // Save back to DB
    const updated = await saveParsedDayModification({
      tripId,
      dayIndex,
      parsedDay: parsed
    });

    res.json(updated);
  } catch (err) {
    console.error("🔥 Error modifying trip day:", err);
    res.status(500).json({ error: "Trip day modification failed" });
  }
});

module.exports = router;
