const express = require("express");
const router = express.Router();
const TripReflection = require("../../models/TripWell/TripReflection");

// 🧠 Load all reflections for a trip (used in TripComplete)
router.get("/tripwell/reflections/:tripId", async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user?.uid;

  try {
    if (!userId) return res.status(401).json({ error: "User not authenticated" });

    const reflections = await TripReflection.find({ tripId, userId }).sort({ dayIndex: 1 });
    res.status(200).json(reflections);
  } catch (err) {
    console.error("🔍 Error loading trip reflections:", err);
    res.status(500).json({ error: "Failed to load reflections" });
  }
});

module.exports = router;
