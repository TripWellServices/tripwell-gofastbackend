const express = require("express");
const path = require("path");
const router = express.Router();

const TripBase = require(path.resolve(__dirname, "../../models/TripWell/TripBase"));
const TripDay = require(path.resolve(__dirname, "../../models/TripWell/TripDay"));
const verifyFirebaseToken = require(path.resolve(__dirname, "../../middleware/verifyFirebaseToken"));

console.log("🔧 Registering /livestatus/:tripId route");
router.get("/livestatus/:tripId", verifyFirebaseToken, async (req, res) => {
  console.log("🔧 /livestatus/:tripId route hit with tripId:", req.params.tripId);
  const { tripId } = req.params;
  const userId = req.user._id;

  try {
    const trip = await TripBase.findById(tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const tripDays = await TripDay.find({ tripId }).sort({ dayIndex: 1 });
    const totalDays = tripDays.length;

    // 🔴 Progressive navigation: Find first incomplete block
    let currentDayIndex = 1;
    let currentBlock = "morning";
    let tripComplete = false;

    // Walk through days in order to find first incomplete block
    for (let day of tripDays) {
      const blocks = day.blocks || {};
      
      if (!blocks.morning?.complete) {
        currentDayIndex = day.dayIndex;
        currentBlock = "morning";
        break;
      } else if (!blocks.afternoon?.complete) {
        currentDayIndex = day.dayIndex;
        currentBlock = "afternoon";
        break;
      } else if (!blocks.evening?.complete) {
        currentDayIndex = day.dayIndex;
        currentBlock = "evening";
        break;
      }
      // If we get here, this day is complete, continue to next day
    }

    // If we've walked through all days and found no incomplete blocks, trip is complete
    if (currentDayIndex > totalDays) {
      tripComplete = true;
      currentDayIndex = totalDays;
      currentBlock = "done";
    }

    // 🔒 Update trip completion status if needed
    if (tripComplete && !trip.tripComplete) {
      await TripBase.findByIdAndUpdate(tripId, { tripComplete: true });
    }

    // 📦 Add full day data for hydration
    let dayData = null;
    const currentDay = tripDays.find(day => day.dayIndex === currentDayIndex);
    if (currentDay) {
      dayData = {
        city: currentDay.city || "",
        dateStr: currentDay.dateStr || "",
        summary: currentDay.summary || "",
        blocks: currentDay.blocks || {}
      };
    }

    return res.json({
      tripId,
      currentDayIndex,
      currentBlock,
      totalDays,
      tripComplete,
      dayData
    });
  } catch (err) {
    console.error("Error fetching trip live status:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
