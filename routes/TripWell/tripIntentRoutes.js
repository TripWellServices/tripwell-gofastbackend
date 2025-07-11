const express = require("express");
const router = express.Router();
const TripIntent = require("../../models/TripWell/TripIntent");
const setTripIntentId = require("../../services/TripWell/setTripIntentId");
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");
const User = require("../../models/User");

// POST /tripwell/tripintent/:tripId
router.post("/tripintent/:tripId", verifyFirebaseToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const firebaseId = req.user.uid;
    const { priorities, vibes, mobility, budget, travelPace } = req.body;

    const user = await User.findOne({ firebaseId });
    if (!user) return res.status(404).json({ error: "User not found" });

    const existing = await TripIntent.findOne({ tripId, userId: user._id });

    if (existing) {
      existing.priorities = priorities;
      existing.vibes = vibes;
      existing.mobility = mobility;
      existing.budget = budget;
      existing.travelPace = travelPace;
      await existing.save();

      await setTripIntentId(user._id, existing._id);
    } else {
      const newIntent = await TripIntent.create({
        tripId,
        userId: user._id,
        priorities,
        vibes,
        mobility,
        budget,
        travelPace,
      });

      await setTripIntentId(user._id, newIntent._id);
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("🔥 TripIntent save error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
