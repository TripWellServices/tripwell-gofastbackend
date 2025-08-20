// routes/TripWell/AnchorSelectSaveRoutes.js

const express = require("express");
const router = express.Router();

const { saveAnchorLogic } = require("../../services/TripWell/anchorlogicSaveService");
const User = require("../../models/User");
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");

// POST /tripwell/anchorselect/save/:tripId
router.post("/anchorselect/save/:tripId", verifyFirebaseToken, async (req, res) => {
  const { tripId } = req.params;
  const { userId, anchorTitles } = req.body;

  if (!tripId || !userId || !Array.isArray(anchorTitles)) {
    return res.status(400).json({ error: "Missing tripId, userId, or anchorTitles" });
  }

  try {
    // ✅ Save enriched anchors (calls Marlo + DB logic)
    await saveAnchorLogic(tripId, userId, anchorTitles);

    // ✅ Update user progress
    await User.findByIdAndUpdate(userId, { anchorSelectComplete: true });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("🔥 AnchorSelectParseSave error:", err);
    return res.status(500).json({ error: "Failed to save and parse anchor selections" });
  }
});

module.exports = router;
