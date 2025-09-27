const express = require("express");
const router = express.Router();

const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");
const TripBase = require("../../models/TripWell/TripBase");
const TripCurrentDays = require("../../models/TripWell/TripCurrentDays");

// 🔥 GET /tripwell/lookback/:tripId — hydrate last completed day for reflections
router.get("/tripwell/lookback/:tripId", verifyFirebaseToken, async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user._id;

  try {
    const trip = await TripBase.findById(tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    // Optional: Add user ownership check here
    // if (!trip.userIds.includes(userId)) return res.status(403).json({ error: "Unauthorized" });

    const tripDays = await TripCurrentDays.find({ tripId }).sort({ dayIndex: 1 });

    const lastCompletedDay = [...tripDays].reverse().find(day => day.complete === true);
    const lastCompletedDayIndex = lastCompletedDay?.dayIndex ?? null;
    const summary = lastCompletedDay?.summary || "";

    return res.json({
      tripId,
      lastCompletedDayIndex,
      tripComplete: trip.tripComplete === true,
      city: trip.city || "",
      summary
    });
  } catch (err) {
    console.error("Lookback hydration error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
