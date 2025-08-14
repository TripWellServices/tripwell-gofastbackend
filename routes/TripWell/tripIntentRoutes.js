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
    const { priorities, vibes, tripId: payloadTripId } = req.body;
    
    console.log("🔍 Backend received payload:", { priorities, vibes, payloadTripId });
    
    // Convert string inputs to arrays for array fields
    const prioritiesArray = priorities ? priorities.split(',').map(p => p.trim()) : [];
    const vibesArray = vibes ? vibes.split(',').map(v => v.trim()) : [];

    console.log("🔍 Converted arrays:", { prioritiesArray, vibesArray });

    const user = await TripWellUser.findOne({ firebaseId });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    console.log("🔍 User from DB:", { tripId: user.tripId, userId: user._id });
    
    if (!user.tripId) return res.status(400).json({ error: "No trip associated with user" });
    
    const tripId = user.tripId;
    const existing = await TripIntent.findOne({ tripId, userId: user._id });
    console.log("🔍 Existing TripIntent found:", !!existing);

    if (existing) {
      console.log("🔍 Updating existing TripIntent");
      existing.priorities = prioritiesArray;
      existing.vibes = vibesArray;
      await existing.save();
      console.log("✅ Updated existing TripIntent");
    } else {
      console.log("🔍 Creating new TripIntent");
      const newTripIntent = await TripIntent.create({
        tripId,
        userId: user._id,
        priorities: prioritiesArray,
        vibes: vibesArray,
      });
      console.log("✅ Created new TripIntent:", newTripIntent._id);
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("🔥 TripIntent save error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
