const express = require("express");
const path = require("path");
const router = express.Router();

const TripCurrentDays = require("../../models/TripWell/TripCurrentDays"););
const TripBase = require(path.resolve(__dirname, "../../models/TripWell/TripBase"));
const verifyFirebaseToken = require(path.resolve(__dirname, "../../middleware/verifyFirebaseToken"));

// POST /block/complete
router.post("/block/complete", verifyFirebaseToken, async (req, res) => {
  const { tripId, dayIndex, blockName } = req.body;

  if (!tripId || dayIndex === undefined || !blockName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 1. Mark the block as complete
    const updatePath = `blocks.${blockName}.complete`;
    const tripDay = await TripCurrentDays.findOneAndUpdate(
      { tripId, dayIndex },
      { $set: { [updatePath]: true } },
      { new: true }
    );

    if (!tripDay) return res.status(404).json({ error: "TripCurrentDays not found" });

    // 2. If all blocks are complete, mark the day complete
    const blocks = tripDay.blocks || {};
    const allBlocksComplete =
      blocks.morning?.complete &&
      blocks.afternoon?.complete &&
      blocks.evening?.complete;

    if (allBlocksComplete && !tripDay.isComplete) {
      await TripCurrentDays.updateOne(
        { tripId, dayIndex },
        { $set: { isComplete: true } }
      );
    }

    // 3. If final day & final evening, mark trip complete
    const allDays = await TripCurrentDays.find({ tripId }).sort({ dayIndex: 1 });
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

// POST /doallcomplete (frontend compatibility)
router.post("/doallcomplete", verifyFirebaseToken, async (req, res) => {
  const { tripId, dayIndex, blockName } = req.body;

  if (!tripId || dayIndex === undefined || !blockName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 1. Mark the block as complete
    const updatePath = `blocks.${blockName}.complete`;
    const tripDay = await TripCurrentDays.findOneAndUpdate(
      { tripId, dayIndex },
      { $set: { [updatePath]: true } },
      { new: true }
    );

    if (!tripDay) return res.status(404).json({ error: "TripCurrentDays not found" });

    // 2. If all blocks are complete, mark the day complete
    const blocks = tripDay.blocks || {};
    const allBlocksComplete =
      blocks.morning?.complete &&
      blocks.afternoon?.complete &&
      blocks.evening?.complete;

    if (allBlocksComplete && !tripDay.isComplete) {
      await TripCurrentDays.updateOne(
        { tripId, dayIndex },
        { $set: { isComplete: true } }
      );
    }

    // 3. Check if this is the final evening block of the final day
    const allDays = await TripCurrentDays.find({ tripId }).sort({ dayIndex: 1 });
    const totalDays = allDays.length;
    const isLastDay = Number(dayIndex) === totalDays;
    const isEvening = blockName === "evening";

    if (isLastDay && isEvening && allBlocksComplete) {
      await TripBase.findByIdAndUpdate(tripId, { $set: { tripComplete: true } });
      return res.json({ next: "tripcomplete" });
    }

    // 4. Check if we should go to reflection (evening block complete)
    if (isEvening && allBlocksComplete) {
      return res.json({ next: "lookback" });
    }

    // 5. Continue to next block
    return res.json({ next: "continue" });
  } catch (err) {
    console.error("🔥 Error in TripDoAllCompleterRoute:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
