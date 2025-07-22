const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middleware/authenticate");
const TripDay = require("../../models/TripWell/TripDay");

// ✅ POST /tripwell/markblockcomplete/:tripId/:dayIndex/:blockName
router.post("/markblockcomplete/:tripId/:dayIndex/:blockName", authenticate, async (req, res) => {
  const { tripId, dayIndex, blockName } = req.params;

  const validBlocks = ["morning", "afternoon", "evening"];
  if (!validBlocks.includes(blockName)) {
    return res.status(400).json({ error: "Invalid block name" });
  }

  try {
    const tripDay = await TripDay.findOne({ tripId, dayIndex });
    if (!tripDay) return res.status(404).json({ error: "TripDay not found" });

    if (!tripDay.blocks[blockName]) {
      return res.status(400).json({ error: `Block '${blockName}' not found in TripDay` });
    }

    tripDay.blocks[blockName].complete = true;
    await tripDay.save();

    res.json({
      success: true,
      updatedBlock: tripDay.blocks[blockName],
    });
  } catch (err) {
    console.error("Error marking block complete:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
