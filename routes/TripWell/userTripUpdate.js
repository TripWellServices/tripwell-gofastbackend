// routes/TripWell/userTripUpdate.js

const express = require("express");
const router = express.Router();
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");
const { setUserTrip } = require("../../services/TripWell/userTripService");
const userResetService = require("../../services/TripWell/userResetService");
const TripWellUser = require("../../models/TripWellUser");
const TripBase = require("../../models/TripWell/TripBase");
const TripPersona = require("../../models/TripWell/TripPersona");
const UserSelections = require("../../models/TripWell/UserSelections");
const TripItinerary = require("../../models/TripWell/TripItinerary");

// POST /api/usertrip/set
router.post("/set", verifyFirebaseToken, async (req, res) => {
  const { tripId } = req.body;
  const firebaseId = req.user.uid;

  try {
    const updatedUser = await setUserTrip(firebaseId, tripId);
    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("User trip update failed:", err);
    res.status(500).json({ error: "Failed to update user trip" });
  }
});

// POST /api/usertrip/reset - Reset user to new user state (cascade delete)
router.post("/reset", async (req, res) => {
  const { userId, resetType = "new_user" } = req.body;

  try {
    console.log(`🔄 Admin reset request for user: ${userId}, type: ${resetType}`);
    
    if (resetType === "new_user") {
      // Complete cascade reset
      const results = await userResetService.resetUserToNew(userId);
      res.status(200).json({ 
        success: true, 
        message: "User reset to new user state",
        results 
      });
    } else {
      // Reset to specific stage
      const { journeyStage, userStatus } = req.body;
      const results = await userResetService.resetUserToStage(userId, journeyStage, userStatus);
      res.status(200).json({ 
        success: true, 
        message: `User reset to ${journeyStage}/${userStatus}`,
        results 
      });
    }
  } catch (err) {
    console.error("User reset failed:", err);
    res.status(500).json({ error: "Failed to reset user: " + err.message });
  }
});

// GET /api/usertrip/reset-options - Get available reset options
router.get("/reset-options", async (req, res) => {
  try {
    const options = userResetService.getResetOptions();
    res.status(200).json({ options });
  } catch (err) {
    console.error("Failed to get reset options:", err);
    res.status(500).json({ error: "Failed to get reset options" });
  }
});

module.exports = router;
