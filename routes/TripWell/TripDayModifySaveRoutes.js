// routes/TripWell/TripDayModifySaveRoutes.js

const express = require("express");
const router = express.Router();
const { parseSingleDayModify } = require("../../services/TripWell/parseSingleDayModify");
const { saveParsedDayModification } = require("../../services/TripWell/singleDayModifyfromParseSaver");

// 💾 Parse and Save final GPT-modified TripDay after user approval
router.post("/tripwell/parseandsave/:tripId/:dayIndex", async (req, res) => {
  const { tripId, dayIndex } = req.params;
  const { gptOutput } = req.body;

  try {
    const dayIndexNum = parseInt(dayIndex, 10);
    if (!tripId || isNaN(dayIndexNum)) {
      return res.status(400).json({ error: "Invalid tripId or dayIndex" });
    }

    const parsedDay = parseSingleDayModify(gptOutput);

    const updated = await saveParsedDayModification({ tripId, dayIndex: dayIndexNum, parsedDay });

    res.status(200).json({ message: "Trip day updated successfully", tripDay: updated });
  } catch (err) {
    console.error("🛑 Error parsing and saving trip day:", err);
    res.status(500).json({ error: "Failed to parse and save trip day" });
  }
});

module.exports = router;
