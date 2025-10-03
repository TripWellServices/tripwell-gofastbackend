const express = require("express");
const router = express.Router();
const preTrainingRacePredictor = require("../../services/preTrainingRacePredictorService");

router.post("/pre-race-predictor", async (req, res) => {
  try {
    const { userId, goalTime } = req.body;
    if (!userId || !goalTime) {
      return res.status(400).json({ error: "Missing userId or goalTime" });
    }

    const result = await preTrainingRacePredictor(userId, goalTime);
    res.json(result);
  } catch (err) {
    console.error("Prediction error:", err);
    res.status(500).json({ error: "Prediction failed", message: err.message });
  }
});

module.exports = router;
