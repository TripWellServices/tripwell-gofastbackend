// routes/TripWell/TripLiveDayRoutes.js

const express = require("express");
const router = express.Router();
const TripDay = require("../../models/TripWell/TripDay");

// 🟦 Get first incomplete TripDay (TripLive hydration)
router.get("/tripwell/triplive/:tripId", async (req, res) => {
  const { tripId } = req.params;

  try {
    const nextDay = await TripDay.findOne({ tripId, complete: { $ne: true } }).sort({ dayIndex: 1 });
    if (!nextDay) return res.status(404).json({ error: "All days complete or none found." });

    res.json(nextDay);
  } catch (err) {
    console.error("Error hydrating TripLive day:", err);
    res.status(500).json({ error: "Failed to fetch TripLive day" });
  }
});

// ✅ Mark day as complete
router.post("/tripwell/markcomplete/:tripId/:dayIndex", async (req, res) => {
  const { tripId, dayIndex } = req.params;

  try {
    const updated = await TripDay.findOneAndUpdate(
      { tripId, dayIndex: parseInt(dayIndex, 10) },
      { $set: { complete: true } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Trip day not found" });
    res.json(updated);
  } catch (err) {
    console.error("Error marking TripDay complete:", err);
    res.status(500).json({ error: "Failed to mark TripDay complete" });
  }
});

module.exports = router;
