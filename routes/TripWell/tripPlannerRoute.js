import express from "express";
import TripIntent from "../../models/TripWell/TripIntent.js";
import GPTSceneSetterService from "../../services/TripWell/GPTSceneSetterService.js";

const router = express.Router();

router.post("/tripwell/tripplanner/:tripId", async (req, res) => {
  try {
    const { tripId } = req.params;
    const { priorities, vibes, mobility, budget, userId } = req.body;

    if (!tripId || !userId) {
      return res.status(400).json({ error: "Missing tripId or userId" });
    }

    // Save or upsert the trip intent
    const existing = await TripIntent.findOne({ tripId });

    if (existing) {
      existing.priorities = priorities;
      existing.vibes = vibes;
      existing.mobility = mobility;
      existing.budget = budget;
      await existing.save();
    } else {
      await TripIntent.create({ tripId, userId, priorities, vibes, mobility, budget });
    }

    // Optional: Kick off Scene Setter now
    const scene = await GPTSceneSetterService({ tripId });

    return res.json({ success: true, scene });
  } catch (err) {
    console.error("TripPlanner route error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
