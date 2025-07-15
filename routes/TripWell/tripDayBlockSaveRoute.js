// routes/TripWell/tripDayBlockSaveRoute.js

const express = require("express");
const router = express.Router();
const TripDay = require("../../models/TripWell/TripDay");

router.post("/tripwell/savefinalblock", async (req, res) => {
  const { tripId, dayIndex, blockName, blockData } = req.body;

  if (!tripId || dayIndex === undefined || !blockName || !blockData) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const day = await TripDay.findOne({ tripId, dayIndex });
    if (!day) return res.status(404).json({ error: "Day not found" });

    day.blocks[blockName] = blockData;
    await day.save();

    res.json({ success: true });
  } catch (err) {
    console.error("Error saving block", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
