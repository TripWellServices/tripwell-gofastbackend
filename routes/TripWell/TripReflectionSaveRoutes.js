// routes/TripWell/TripReflectionSaveRoutes.js

const express = require("express");
const router = express.Router();
const TripReflection = require("../../models/TripWell/TripReflection");

router.post("/tripwell/reflect/:tripId", async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user?.uid;
    const {
      overallMood,
      favoriteMemory,
      lessonsLearned,
      wouldDoDifferently
    } = req.body;

    if (!userId) return res.status(401).json({ error: "User not authenticated" });

    const reflection = await TripReflection.create({
      tripId,
      userId,
      overallMood,
      favoriteMemory,
      lessonsLearned,
      wouldDoDifferently
    });

    res.status(200).json({ message: "Reflection saved", reflection });
  } catch (err) {
    console.error("🧠 Error saving trip reflection:", err);
    res.status(500).json({ error: "Failed to save trip reflection" });
  }
});

module.exports = router;
