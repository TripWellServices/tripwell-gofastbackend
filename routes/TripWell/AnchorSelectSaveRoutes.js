// routes/TripWell/AnchorSelectSaveRoutes.js

const express = require("express");
const router = express.Router();

const { saveAnchorLogic } = require("../../services/TripWell/anchorlogicSaveService");
const { getAnchorData } = require("../../services/TripWell/gptanchorparserService");
const TripWellUser = require("../../models/TripWellUser");
const AnchorLogic = require("../../models/TripWell/AnchorLogic");
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");

// POST /tripwell/anchorselect/save/:tripId
router.post("/anchorselect/save/:tripId", verifyFirebaseToken, async (req, res) => {
  const { tripId } = req.params;
  const { anchorTitles } = req.body;
  
  // Get Firebase user from token
  const firebaseId = req.user.uid;
  
  if (!tripId || !Array.isArray(anchorTitles)) {
    return res.status(400).json({ error: "Missing tripId or anchorTitles" });
  }

  try {
    // Find the TripWellUser by Firebase ID
    const user = await TripWellUser.findOne({ firebaseId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    console.log("🔍 Saving anchors for user:", user._id, "trip:", tripId);
    
    // ✅ Save enriched anchors (calls Marlo + DB logic)
    await saveAnchorLogic(tripId, user._id, anchorTitles);

    // ✅ Update user progress
    await TripWellUser.findByIdAndUpdate(user._id, { anchorSelectComplete: true });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("🔥 AnchorSelectParseSave error:", err);
    return res.status(500).json({ error: "Failed to save and parse anchor selections" });
  }
});

// GET /tripwell/anchorselect/status/:tripId - Check if user has completed anchor selection
router.get("/anchorselect/status/:tripId", verifyFirebaseToken, async (req, res) => {
  const { tripId } = req.params;
  const firebaseId = req.user.uid;
  
  if (!tripId) {
    return res.status(400).json({ error: "Missing tripId" });
  }

  try {
    // Find the TripWellUser by Firebase ID
    const user = await TripWellUser.findOne({ firebaseId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    console.log("🔍 Checking anchor status for user:", user._id, "trip:", tripId);
    
    // Check if user has saved anchor selections
    const anchorLogic = await AnchorLogic.findOne({ 
      tripId: tripId, 
      userId: user._id 
    });
    
    if (!anchorLogic) {
      return res.status(200).json({ 
        hasCompletedAnchorSelection: false,
        anchors: null,
        message: "User has not completed anchor selection yet"
      });
    }
    
    // Return the saved anchor data
    return res.status(200).json({ 
      hasCompletedAnchorSelection: true,
      anchors: anchorLogic.enrichedAnchors,
      createdAt: anchorLogic.createdAt,
      message: "User has completed anchor selection"
    });
    
  } catch (err) {
    console.error("🔥 Error checking anchor status:", err);
    return res.status(500).json({ error: "Failed to check anchor selection status" });
  }
});

module.exports = router;
