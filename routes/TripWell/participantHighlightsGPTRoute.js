const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

const TripWellUser = require("../../models/TripWell/TripWellUser");
const TripBase = require("../../models/TripWell/TripBase");
const TripIntent = require("../../models/TripWell/TripIntent");

const participantHighlightsGPT = require("../../services/TripWell/participantHighlightsGPTService");

router.get("/tripwell/participant/highlights", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing token" });
    }

    const token = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(token);
    const user = await TripWellUser.findOne({ firebaseId: decoded.uid });

    if (!user || !user.tripId) {
      return res.status(404).json({ error: "User or trip not found" });
    }

    const trip = await TripBase.findById(user.tripId);
    const intent = await TripIntent.findOne({ tripId: user.tripId });

    const highlights = await participantHighlightsGPT(trip, intent);
    return res.json(highlights);
  } catch (err) {
    console.error("❌ Error in highlights route:", err);
    return res.status(500).json({ error: "Failed to fetch highlights" });
  }
});

module.exports = router;
