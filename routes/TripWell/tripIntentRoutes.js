const express = require("express");
const path = require("path");
const router = express.Router();

const TripIntent = require(path.resolve(__dirname, "../../models/TripWell/TripIntent"));
const verifyFirebaseToken = require(path.resolve(__dirname, "../../middleware/verifyFirebaseToken"));
const TripWellUser = require(path.resolve(__dirname, "../../models/TripWellUser"));

// POST /tripwell/tripintent
router.post("/tripintent", verifyFirebaseToken, async (req, res) => {
  try {
    const firebaseId = req.user.uid;
    const { priorities, vibes, mobility, budget, travelPace } = req.body;
    
    // Convert string inputs to arrays for array fields
    const prioritiesArray = priorities ? priorities.split(',').map(p => p.trim()) : [];
    const vibesArray = vibes ? vibes.split(',').map(v => v.trim()) : [];
    const mobilityArray = mobility ? mobility.split(',').map(m => m.trim()) : [];
    const travelPaceArray = travelPace ? travelPace.split(',').map(t => t.trim()) : [];

    const user = await TripWellUser.findOne({ firebaseId });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    if (!user.tripId) return res.status(400).json({ error: "No trip associated with user" });
    
    const tripId = user.tripId;
    const existing = await TripIntent.findOne({ tripId, userId: user._id });

    if (existing) {
      existing.priorities = prioritiesArray;
      existing.vibes = vibesArray;
      existing.mobility = mobilityArray;
      existing.budget = budget;
      existing.travelPace = travelPaceArray;
      await existing.save();
    } else {
      await TripIntent.create({
        tripId,
        userId: user._id,
        priorities: prioritiesArray,
        vibes: vibesArray,
        mobility: mobilityArray,
        budget,
        travelPace: travelPaceArray,
      });
    }

    // Update user's tripIntentId to mark that intent exists
    user.tripIntentId = tripId;
    await user.save();

    return res.json({ success: true });
  } catch (err) {
    console.error("🔥 TripIntent save error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
