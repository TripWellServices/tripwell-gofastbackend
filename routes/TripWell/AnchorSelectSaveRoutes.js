// routes/TripWell/AnchorSelectSaveRoutes.js

const express = require("express");
const router = express.Router();

const { saveAnchorSelect } = require("../../services/TripWell/anchorselectService");
const { parseAnchorSuggestionsWithLogic } = require("../../services/TripWell/gptanchorparserService");
const { saveAnchorLogic } = require("../../services/TripWell/anchorlogicSaveService");

// POST /tripwell/anchorselectparsesave/:tripId
router.post("/anchorselectparsesave/:tripId", async (req, res) => {
  const { tripId } = req.params;
  const { userId, anchorTitles } = req.body;

  if (!tripId || !userId || !Array.isArray(anchorTitles)) {
    return res.status(400).json({ error: "Missing tripId, userId, or anchorTitles" });
  }

  try {
    // 1. Save selected titles
    await saveAnchorSelect(tripId, userId, anchorTitles);

    // 2. Prepare minimal hydration for Marlo
    const placeholderAnchors = anchorTitles.map((title) => ({
      title,
      description: "",
      location: "",
      isDayTrip: false,
      suggestedFollowOn: "",
    }));

    // 3. Parse with Marlo
    const enriched = await parseAnchorSuggestionsWithLogic(placeholderAnchors);

    // 4. Save to AnchorLogic
    await saveAnchorLogic(tripId, userId, enriched);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("🔥 AnchorSelectParseSave error:", err);
    return res.status(500).json({ error: "Failed to save and parse anchor selections" });
  }
});

module.exports = router;
