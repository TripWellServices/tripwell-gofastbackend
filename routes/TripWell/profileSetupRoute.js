const express = require("express");
const router = express.Router();
const TripWellUser = require("../../models/TripWellUser");
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");
const axios = require("axios");

// Environment variables
const TRIPWELL_AI_BRAIN = process.env.TRIPWELL_AI_BRAIN || "https://tripwell-ai.onrender.com";

// Update user profile (after Access step)
router.put("/profile", verifyFirebaseToken, async (req, res) => {
  const firebaseId = req.user.uid; // from Firebase token

  const {
    firstName,
    lastName,
    hometownCity,
    state,
    travelStyle,
    tripVibe
  } = req.body;

  try {
    // First get the current user to check their funnel stage
    const currentUser = await TripWellUser.findOne({ firebaseId });
    
    // Update profile and potentially exit funnel
    const user = await TripWellUser.findOneAndUpdate(
      { firebaseId },
      {
        $set: {
          firstName,
          lastName,
          hometownCity,
          state,
          travelStyle,
          tripVibe,
          profileComplete: true,
          // If user was in funnel, upgrade them to full_app
          ...(currentUser?.funnelStage && currentUser.funnelStage !== 'full_app' && {
            funnelStage: 'full_app'
          })
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 🎯 TRIGGER: Call Python for profile completion analysis
    try {
      console.log(`🎯 Profile completed - calling Python for user: ${user.email}`);
      
      const pythonResponse = await axios.post(`${TRIPWELL_AI_BRAIN}/analyze-user`, {
        user_id: user._id.toString(),
        context: "profile_completed"
      }, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (pythonResponse.data.success) {
        console.log(`✅ Python analysis complete for profile completion: ${user.email}`);
        console.log(`📧 Actions taken: ${pythonResponse.data.actions_taken.length}`);
        
        // Log each action taken
        pythonResponse.data.actions_taken.forEach(action => {
          console.log(`  📧 ${action.campaign}: ${action.status} - ${action.reason}`);
        });
      } else {
        console.error(`❌ Python analysis failed for profile completion: ${user.email}`);
      }
    } catch (pythonError) {
      // Don't fail profile update if Python service fails
      console.error(`❌ Failed to call Python for profile completion: ${user.email}:`, pythonError.message);
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("🔥 Error updating profile:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
