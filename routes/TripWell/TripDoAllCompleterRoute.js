const express = require("express");
const path = require("path");
const router = express.Router();

const TripDay = require(path.resolve(__dirname, "../../models/TripWell/TripDay"));
const TripBase = require(path.resolve(__dirname, "../../models/TripWell/TripBase"));
const verifyFirebaseToken = require(path.resolve(__dirname, "../../middleware/verifyFirebaseToken"));

// PATCH /tripwell/block/complete
router.patch("/tripwell/block/complete", verifyFirebaseToken, async (req, res) => {
  const { tripId, dayIndex, blockName } = req.body;

  if (!tripId || dayIndex === undefined || !blockName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 1. Mark the block as complete
    const updatePath = `blocks.${blockName}.complete`;
    const tripDay = await TripDay.findOneAndUpdate(
      { tripId, dayIndex },
      { $set: { [updatePath]: true } },
      { new: true }
    );

    if (!tripDay) return res.status(404).json({ error: "TripDay not found" });

    // 2. If all blocks are complete, mark the day complete
    const blocks = tripDay.blocks || {};
    const allBlocksComplete =
      blocks.morning?.complete &&
      blocks.afternoon?.complete &&
      blocks.evening?.complete;

    if (allBlocksComplete && !tripDay.isComplete) {
      await TripDay.updateOne(
        { tripId, dayIndex },
        { $set: { isComplete: true } }
      );
    }

    // 3. If final day & final evening, mark trip complete
    const allDays = await TripDay.find({ tripId }).sort({ dayIndex: 1 });
    const totalDays = allDays.length;
    const isLastDay = Number(dayIndex) === totalDays - 1;
    const isEvening = blockName === "evening";

    if (isLastDay && isEvening) {
      await TripBase.findByIdAndUpdate(tripId, { $set: { tripComplete: true } });
    }

    // 4. Success
    return res.sendStatus(200);
  } catch (err) {
    console.error("🔥 Error in TripDoAllCompleterRoute:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
