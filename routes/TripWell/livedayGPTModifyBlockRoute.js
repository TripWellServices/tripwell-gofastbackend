const express = require("express");
const router = express.Router();
const path = require("path");
const verifyFirebaseToken = require(path.resolve(__dirname, "../../middleware/verifyFirebaseToken"));

const { tripDayGPTModifierService } = require("../../services/TripWell/tripDayGPTModifierService");
const { parseBlockModifyService } = require("../../services/TripWell/parseBlockModifyService");
const { saveModifiedTripBlock } = require("../../services/TripWell/saveModifiedTripBlock");

/**
 * POST /tripwell/livedaygpt/block
 * Modifies a single itinerary block (morning, afternoon, evening) via GPT
 */
router.post("/livedaygpt/block", verifyFirebaseToken, async (req, res) => {
  const { tripId, dayIndex, block, feedback } = req.body;

  if (!tripId || typeof dayIndex !== "number" || !block || !feedback) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const rawGpt = await tripDayGPTModifierService({ tripId, dayIndex, block, feedback });
    const parsedBlock = parseBlockModifyService(rawGpt);
    const updatedDay = await saveModifiedTripBlock({ tripId, dayIndex, block, newBlock: parsedBlock });

    res.status(200).json({ updatedBlock: updatedDay.blocks[block] });
  } catch (err) {
    console.error("LiveDay GPT error:", err);
    res.status(500).json({ error: "Failed to modify live day block" });
  }
});

module.exports = router;
