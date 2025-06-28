// routes/TripWell/TripDayModifySaveRoutes.js

const express = require("express");
const router = express.Router();
const TripDay = require("../../models/TripWell/TripDay");

router.post("/tripwell/saveday/:tripId/:dayIndex", async (req, res) => {
  const { tripId, dayIndex } = req.params;
  const { summary, blocks } = req.body;

  try {
    const dayIndexNum = parseInt(dayIndex, 10);
    if (isNaN(dayIndexNum)) {
      return res.status(400).json({ error: "Invalid day index" });
    }

    if (!summary || typeof blocks !== "object") {
      return res.status(400).json({ error: "Missing summary or blocks" });
    }

    const updated = await TripDay.findOneAndUpdate(
      { tripId, dayIndex: dayIndexNum },
      { summary, blocks },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Trip day not found" });
    }

    res.status(200).json({ message: "Trip day updated successfully", tripDay: updated });
  } catch (err) {
    console.error("🛑 Error saving trip day:", err);
    res.status(500).json({ error: "Failed to save trip day" });
  }
});

module.exports = router;
