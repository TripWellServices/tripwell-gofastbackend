const express = require("express");
const router = express.Router();

const { parseAnchorSuggestionsWithLogic } = require("../../services/TripWell/gptanchorparserService");
const { saveAnchorLogic } = require("../../services/TripWell/anchorlogicSaveService");
const User = require("../../models/User");

// POST /tripwell/anchorselectparsesave/:tripId
router.post("/anchorselectparsesave/:tripId", async (req, res) => {
  const { tripId } = req.params;
  const { userId, anchorTitles } = req.body;

  if (!tripId || !userId || !Array.isArray(anchorTitles)) {
    return res.status(400).json({ error: "Missing tripId, userId, or anchorTitles" });
  }

  try {
    // 1. Build placeholder objects for GPT parsing
    const placeholderAnchors = anchorTitles.map((title) => ({
      title,
      description: "",
      location: "",
      isDayTrip: false,
      suggestedFollowOn: "",
    }));

    // 2. Parse via GPT (Marlo)
    const enriched = await parseAnchorSuggestionsWithLogic(placeholderAnchors);

    // 3. Save enriched anchors to AnchorLogic
    await saveAnchorLogic(tripId, userId, enriched);

    // 4. ✅ Mark anchorSelectComplete = true on User
    await User.findOneAndUpdate(
      { userId },
      { anchorSelectComplete: true }
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("🔥 AnchorSelectParseSave error:", err);
    return res.status(500).json({ error: "Failed to save and parse anchor selections" });
  }
});

module.exports = router;