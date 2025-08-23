const express = require("express");
const router = express.Router();
const TripReflection = require("../../models/TripWell/TripReflection");
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");

// 🧠 Load all reflections for a trip (used in TripComplete)
router.get("/reflections/:tripId", verifyFirebaseToken, async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user?.uid;

  try {
    console.log("🔍 Loading reflections for tripId:", tripId, "userId:", userId);
    
    if (!userId) return res.status(401).json({ error: "User not authenticated" });

    const reflections = await TripReflection.find({ tripId, userId }).sort({ dayIndex: 1 });
    console.log("✅ Found", reflections.length, "reflections");
    res.status(200).json(reflections);
  } catch (err) {
    console.error("🔍 Error loading trip reflections:", err);
    res.status(500).json({ error: "Failed to load reflections" });
  }
});

module.exports = router;
