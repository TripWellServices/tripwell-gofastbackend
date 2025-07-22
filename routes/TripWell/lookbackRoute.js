const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middleware/authenticate");

const TripBase = require("../../models/TripWell/TripBase");
const TripDay = require("../../models/TripWell/TripDay");

// 🔥 GET /tripwell/lookback/:tripId — hydrate last completed day for reflections
router.get("/tripwell/lookback/:tripId", authenticate, async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user._id;

  try {
    const trip = await TripBase.findById(tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    // You could also add a trip participant check here if needed:
    // if (!trip.userIds.includes(userId)) return res.status(403).json({ error: "Unauthorized" });

    const tripDays = await TripDay.find({ tripId }).sort({ dayIndex: 1 });

    const lastCompletedDay = [...tripDays].reverse().find(day => day.complete === true);
    const lastCompletedDayIndex = lastCompletedDay?.dayIndex ?? null;

    return res.json({
      tripId,
      lastCompletedDayIndex,
      tripComplete: trip.tripComplete === true,
      city: trip.city || ""
    });
  } catch (err) {
    console.error("Lookback hydration error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
