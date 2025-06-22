const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const { saveAnchorSelection } = require("../../services/TripWell/anchorSelectService");
const { parseAnchorSuggestionsWithLogic } = require("../../services/TripWell/gptanchorparserService");
const AnchorLogic = require("../../models/TripWell/AnchorLogic"); // <-- you'll create this model

router.post("/tripwell/anchorselects/:tripId", async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user?.uid;
    const { selectedAnchors } = req.body;

    if (!userId) return res.status(401).json({ error: "User not authenticated" });
    if (!Array.isArray(selectedAnchors) || selectedAnchors.length === 0) {
      return res.status(400).json({ error: "Must provide selectedAnchors" });
    }

    // Step 1: Save original anchor selection
    const savedSelection = await saveAnchorSelection({ tripId, userId, selectedAnchors });

    // Step 2: Send to Marlo for logic parsing
    const parsedAnchors = await parseAnchorSuggestionsWithLogic(selectedAnchors);

    // Step 3: Save parsed logic
    const logicDoc = await AnchorLogic.create({
      tripId: new mongoose.Types.ObjectId(tripId),
      userId,
      parsedAnchors,
    });

    res.status(200).json({
      message: "Anchor selection + logic saved",
      anchorSelectId: savedSelection._id,
      anchorLogicId: logicDoc._id,
    });
  } catch (err) {
    console.error("🛑 Anchor Select + Logic Error:", err);
    res.status(500).json({ error: "Failed to save anchor selection + logic" });
  }
});

module.exports = router;