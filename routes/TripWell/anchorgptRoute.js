const express = require("express");
const router = express.Router();
const { generateAnchorSuggestions } = require("../../services/TripWell/anchorgptService");

// GET /anchorgpt/:tripId
router.get("/anchorgpt/:tripId", async (req, res) => {
  console.log("🎯 ANCHOR ROUTE HIT! URL:", req.url);
  console.log("🎯 Params:", req.params);
  console.log("🎯 Query:", req.query);
  
  const { tripId } = req.params;
  const { userId } = req.query;

  if (!tripId || !userId) {
    return res.status(400).json({ error: "Missing tripId or userId" });
  }

  try {
    console.log("🔍 Generating anchor suggestions for tripId:", tripId, "userId:", userId);
    const result = await generateAnchorSuggestions({ tripId, userId });
    console.log("✅ Anchor suggestions generated:", result.anchors?.length || 0, "anchors");
    res.status(200).json(result.anchors);
  } catch (err) {
    console.error("🔥 Anchor GPT Route Error:", err);
    res.status(500).json({ error: "Failed to generate anchor suggestions" });
  }
});

module.exports = router;
