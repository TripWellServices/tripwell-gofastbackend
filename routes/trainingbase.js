const express = require("express");
const router = express.Router();
const TrainingBase = require("../models/TrainingBase");

router.get("/by-user/:userId", async (req, res) => {
  try {
    const trainingBase = await TrainingBase.findOne({ userId: req.params.userId });
    if (!trainingBase) {
      return res.status(404).json({ message: "Training base not found" });
    }
    res.json(trainingBase);
  } catch (err) {
    console.error("❌ Error fetching training base:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
