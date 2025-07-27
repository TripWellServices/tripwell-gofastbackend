const express = require("express");
const router = express.Router();
const TripDay = require("../../models/TripWell/TripDay");
const TripBase = require("../../models/TripWell/TripBase");
const { authenticate } = require("../../middleware/authenticate");

router.post("/tripwell/blockcomplete", authenticate, async (req, res) => {
  const { tripId, dayIndex, blockName } = req.body;

  try {
    // 1. Mark the block as complete
    const updatePath = `blocks.${blockName}.complete`;
    const tripDay = await TripDay.findOneAndUpdate(
      { tripId, dayIndex },
      { $set: { [updatePath]: true } },
      { new: true }
    );

    if (!tripDay) return res.sendStatus(404);

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

    // 3. If this is the final evening, mark the trip complete
    const allDays = await TripDay.find({ tripId }).sort({ dayIndex: 1 });
    const totalDays = allDays.length;

    const isLastDay = Number(dayIndex) === totalDays - 1;
    const isEvening = blockName === "evening";

    if (isLastDay && isEvening) {
      await TripBase.findByIdAndUpdate(tripId, { $set: { tripComplete: true } });
    }

    // 4. Done. No payload returned.
    return res.sendStatus(200);
  } catch (err) {
    console.error("Error in TripBlockCompleterRoute:", err);
    return res.sendStatus(500);
  }
});

module.exports = router;
