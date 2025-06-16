// routes/tripwell/sceneSetter.js
const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const Trip = require("../../models/TripWell/TripBase");
const GPTSceneSetterService = require("../../services/TripWell/GPTSceneSetterService");

router.get("/gpt/scenesetter/:tripId", async (req, res) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) return res.status(401).json({ error: "Missing token" });

    const decoded = await admin.auth().verifyIdToken(token);
    const userId = decoded.uid;

    const trip = await Trip.findById(req.params.tripId);
    if (!trip || trip.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized or trip not found" });
    }

    const scene = await GPTSceneSetterService.generateSceneSetter(trip);
    return res.json({ scene });

  } catch (err) {
    console.error("🔥 Scene Setter error:", err);
    return res.status(500).json({ error: "Failed to generate scene setter" });
  }
});

module.exports = router;
