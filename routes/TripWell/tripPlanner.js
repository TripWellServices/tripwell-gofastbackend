const express = require("express");
const router = express.Router();

const TripIntent = require("../../models/TripWell/TripIntent");
const GPTSceneSetterService = require("../../services/TripWell/GPTSceneSetterService");

router.post("/tripwell/tripplanner/:tripId", async (req, res) => {
  try {
    const { tripId } = req.params;
    const { priorities, vibes, mobility, budget, travelPace, userId } = req.body;

    if (!tripId || !userId) {
      return res.status(400).json({ error: "Missing tripId or userId" });
    }

    const existing = await TripIntent.findOne({ tripId });

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

    // Generate scene text (trip intro)
    const scene = await GPTSceneSetterService.generateSceneSetter(tripId, userId);

    return res.json({ success: true, scene });
  } catch (err) {
    console.error("🔥 TripPlanner route error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
