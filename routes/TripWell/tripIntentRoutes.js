const express = require("express");
const path = require("path");
const router = express.Router();

const TripIntent = require(path.resolve(__dirname, "../../models/TripWell/TripIntent"));
const verifyFirebaseToken = require(path.resolve(__dirname, "../../middleware/verifyFirebaseToken"));
const TripWellUser = require(path.resolve(__dirname, "../../models/TripWellUser"));

// POST /tripwell/tripintent/:tripId
router.post("/tripintent/:tripId", verifyFirebaseToken, async (req, res) => {
  try {
    const { tripId } = req.params;
    const firebaseId = req.user.uid;
    const { priorities, vibes, mobility, budget, travelPace } = req.body;

    const user = await TripWellUser.findOne({ firebaseId });
    if (!user) return res.status(404).json({ error: "User not found" });

    const existing = await TripIntent.findOne({ tripId, userId: user._id });

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
        userId: user._id,
        priorities,
        vibes,
        mobility,
        budget,
        travelPace,
      });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("🔥 TripIntent save error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
