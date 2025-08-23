const express = require("express");
const router = express.Router();
const { verifyFirebaseToken } = require("../../middleware/verifyFirebaseToken");

const { askAngelaLiveService } = require("../../services/TripWell/askAngelaLiveService");

/**
 * POST /tripwell/livedaygpt/ask
 * Handles real-time trip Q&A from the user
 */
router.post("/tripwell/livedaygpt/ask", verifyFirebaseToken, async (req, res) => {
  const { tripId, dayIndex, blockName, question } = req.body;

  if (!tripId || typeof dayIndex !== "number" || !question) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const answer = await askAngelaLiveService({ tripId, dayIndex, blockName, question });
    res.status(200).json({ answer });
  } catch (err) {
    console.error("Ask Angela Live error:", err);
    res.status(500).json({ error: "Failed to get answer from Angela" });
  }
});

module.exports = router;