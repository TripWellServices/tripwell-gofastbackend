const express = require("express");
const router = express.Router();

const TripBase = require("../../models/TripWell/TripBase");
const TripDay = require("../../models/TripWell/TripDay");
const { authenticate } = require("../../middleware/authenticate");

router.get("/tripwell/livestatus/:tripId", authenticate, async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user._id;

  try {
    const trip = await TripBase.findById(tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const tripDays = await TripDay.find({ tripId }).sort({ dayIndex: 1 });
    const totalDays = tripDays.length;

    const currentDay = tripDays.find((day) => !day.complete);
    const currentDayIndex = currentDay ? currentDay.dayIndex : totalDays;

    let currentBlock = "morning";

    if (currentDay) {
      const blocks = currentDay.blocks || {};
      if (!blocks.morning?.complete) currentBlock = "morning";
      else if (!blocks.afternoon?.complete) currentBlock = "afternoon";
      else if (!blocks.evening?.complete) currentBlock = "evening";
      else {
        currentBlock = "done";
      }
    }

    // 🔒 Canonical: Mark trip as complete if final evening is done
    const isLastDay = currentDayIndex === totalDays;
    const finalDay = tripDays[totalDays - 1];

    const finalEveningComplete = finalDay?.blocks?.evening?.complete === true;

    if (!trip.tripComplete && isLastDay && finalEveningComplete) {
      await TripBase.findByIdAndUpdate(tripId, { tripComplete: true });
    }

    return res.json({
      tripId,
      currentDayIndex,
      currentBlock,
      totalDays,
      tripComplete: trip.tripComplete || (isLastDay && finalEveningComplete),
    });
  } catch (err) {
    console.error("Error fetching trip live status:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
