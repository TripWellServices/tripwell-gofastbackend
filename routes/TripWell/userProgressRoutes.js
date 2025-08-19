// routes/TripWell/userProgressRoutes.js

const express = require("express");
const router = express.Router();

const TripWellUser = require("../../models/TripWellUser");
const TripBase = require("../../models/TripWell/TripBase");
const TripIntent = require("../../models/TripWell/TripIntent");
const AnchorLogic = require("../../models/TripWell/AnchorLogic");
const TripDay = require("../../models/TripWell/TripDay");
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");

// GET /tripwell/user/progress/:tripId - Get complete user progress for a trip
router.get("/progress/:tripId", verifyFirebaseToken, async (req, res) => {
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
    
    console.log("🔍 Checking complete progress for user:", user._id, "trip:", tripId);
    
    // Check all steps
    const [tripBase, tripIntent, anchorLogic, tripDays] = await Promise.all([
      TripBase.findById(tripId),
      TripIntent.findOne({ tripId: tripId, userId: user._id }),
      AnchorLogic.findOne({ tripId: tripId, userId: user._id }),
      TripDay.find({ tripId: tripId }).sort({ dayIndex: 1 })
    ]);
    
    const progress = {
      tripId: tripId,
      userId: user._id,
      steps: {
        tripSetup: {
          completed: !!tripBase,
          data: tripBase || null
        },
        tripIntent: {
          completed: !!tripIntent && tripIntent.hasMeaningfulData(),
          data: tripIntent || null
        },
        anchorSelection: {
          completed: !!anchorLogic,
          data: anchorLogic ? anchorLogic.enrichedAnchors : null,
          createdAt: anchorLogic?.createdAt || null
        },
        itineraryGeneration: {
          completed: !!(tripDays && tripDays.length > 0),
          data: tripDays || null,
          totalDays: tripDays ? tripDays.length : 0
        }
      },
      nextStep: null,
      overallProgress: 0
    };
    
    // Determine next step
    if (!progress.steps.tripSetup.completed) {
      progress.nextStep = "tripSetup";
    } else if (!progress.steps.tripIntent.completed) {
      progress.nextStep = "tripIntent";
    } else if (!progress.steps.anchorSelection.completed) {
      progress.nextStep = "anchorSelection";
    } else if (!progress.steps.itineraryGeneration.completed) {
      progress.nextStep = "itineraryGeneration";
    } else {
      progress.nextStep = "completed";
    }
    
    // Calculate overall progress percentage
    const completedSteps = Object.values(progress.steps).filter(step => step.completed).length;
    progress.overallProgress = Math.round((completedSteps / 4) * 100);
    
    return res.status(200).json(progress);
    
  } catch (err) {
    console.error("🔥 Error checking user progress:", err);
    return res.status(500).json({ error: "Failed to check user progress" });
  }
});

module.exports = router;
