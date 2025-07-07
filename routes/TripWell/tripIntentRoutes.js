const express = require("express");
const router = express.Router();
const TripIntent = require("../../models/TripWell/TripIntent");
const setTripIntentId = require("../../services/TripWell/setTripIntentId");

router.post("/tripintent/:tripId", async (req, res) => {
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

      // 🔁 Re-link to user in case not already set
      await setTripIntentId(userId, existing._id);
    } else {
      const newIntent = await TripIntent.create({
        tripId,
        userId,
        priorities,
        vibes,
        mobility,
        budget,
        travelPace,
      });

      await setTripIntentId(userId, newIntent._id);
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("🔥 TripIntent save error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;