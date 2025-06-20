// routes/TripWell/tripPlanner.js

const express = require("express");
const router = express.Router();

const TripIntent = require("../../models/TripWell/TripIntent");

// ✅ DO NOT include /tripwell here — it's mounted in index.js
router.post("/tripplanner/:tripId", async (req, res) => {
  try {
    const { tripId } = req.params;
    const { priorities, vibes, mobility, budget, travelPace, userId } = req.body;

    if (!tripId || !userId) {
      return res.status(400).json({ error: "Missing tripId or userId" });
    }

    const existing = await TripIntent.findOne({ tripId, userId });

    if (existing) {
      existing.priorities = priorities;
      existing.vibes = vibes;
      existing.mobility = mobility;
      existing.budget = budget;
      existing.travelPace = travelPace;
      await existing.save();
    } else {
      await TripIntent.create({
        tripId,
        userId,
        priorities,
        vibes,
        mobility,
        budget,
        travelPace,
      });
    }

    return res.json({ success: true }); // No GPT scene generation for now
  } catch (err) {
    console.error("🔥 TripPlanner route error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
