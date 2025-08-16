const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const router = express.Router();

const TripIntent = require(path.resolve(__dirname, "../../models/TripWell/TripIntent"));
const verifyFirebaseToken = require(path.resolve(__dirname, "../../middleware/verifyFirebaseToken"));
const TripWellUser = require(path.resolve(__dirname, "../../models/TripWellUser"));

// POST /tripwell/tripintent
router.post("/tripintent", verifyFirebaseToken, async (req, res) => {
  try {
    const firebaseId = req.user.uid;
    const { priorities, vibes, mobility, travelPace, budget, tripId: payloadTripId } = req.body;
    
    console.log("🔥 Incoming req.body:", req.body);
    
    const user = await TripWellUser.findOne({ firebaseId });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    console.log("tripId from user doc:", user.tripId, typeof user.tripId);
    console.log("TripIntent tripId type in DB:", typeof (await TripIntent.findOne())?.tripId);
    
    console.log("🔍 Backend received payload:", { priorities, vibes, mobility, travelPace, budget, payloadTripId });
    
    // Handle arrays directly - no more comma splitting
    const prioritiesArray = Array.isArray(priorities) ? priorities : [];
    const vibesArray = Array.isArray(vibes) ? vibes : [];
    const mobilityArray = Array.isArray(mobility) ? mobility : [];
    const travelPaceArray = Array.isArray(travelPace) ? travelPace : [];

    console.log("🔍 Arrays received:", { prioritiesArray, vibesArray, mobilityArray, travelPaceArray });
    
    console.log("🔍 User from DB:", { tripId: user.tripId, userId: user._id });
    
    if (!user.tripId) return res.status(400).json({ error: "No trip associated with user" });
    
    const tripId = user.tripId;
         const existing = await TripIntent.findOne({
       tripId: new mongoose.Types.ObjectId(tripId),
       userId: user._id
     });
    console.log("🔍 Existing TripIntent found:", !!existing);

    if (existing) {
      console.log("🔍 Updating existing TripIntent");
      existing.priorities = prioritiesArray;
      existing.vibes = vibesArray;
      existing.mobility = mobilityArray;
      existing.travelPace = travelPaceArray;
      existing.budget = budget || "";
      await existing.save();
      console.log("✅ Updated existing TripIntent");
    } else {
      console.log("🔍 Creating new TripIntent");
      const newTripIntent = await TripIntent.create({
        tripId,
        userId: user._id,
        priorities: prioritiesArray,
        vibes: vibesArray,
        mobility: mobilityArray,
        travelPace: travelPaceArray,
        budget: budget || ""
      });
      console.log("✅ Created new TripIntent:", newTripIntent._id);
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("🔥 TripIntent save error:", err);
    console.error("🔥 Error details:", {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
