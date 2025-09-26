const express = require("express");
const router = express.Router();
const TripWellUser = require("../../models/TripWell/TripWellUser");
// TripWellFirebaseOnly model removed - using TripWellUser only
// userTransferService removed - no longer needed
const { savePersonaScores } = require("../../services/personaScoreService");
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
    homeState,
    persona,
    planningStyle,
    dreamDestination
  } = req.body;

  try {
    // First get the current user to check their funnel stage
    const currentUser = await TripWellUser.findOne({ firebaseId });
    
    // Use PersonaScore service for clean weight calculation
    const userSelections = { persona, planningStyle };
    const personaScore = await savePersonaScores(currentUser._id, userSelections);
    
    // Update profile and set state flags
    // Update user with profile data
    const user = await TripWellUser.findOneAndUpdate(
      { firebaseId },
      {
        $set: {
          firstName,
          lastName,
          hometownCity,
          homeState, // Use homeState from request body
          persona,
          planningStyle,
          dreamDestination,
          // Profile is now complete - no flags needed, just data existence
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Profile setup complete - user already exists in TripWellUser

    // 🎯 TRIGGER: Call Python for profile completion analysis
    try {
      console.log(`🎯 Profile completed - calling Python for user: ${user.email}`);
      console.log(`🔍 Python service URL: ${TRIPWELL_AI_BRAIN}`);
      console.log(`🔍 User ID being sent: ${user._id.toString()}`);
      
      const pythonResponse = await axios.post(`${TRIPWELL_AI_BRAIN}/useactionendpoint`, {
        user_id: user._id.toString(),
        firebase_id: user.firebaseId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        tripId: user.tripId,
        createdAt: user.createdAt,
        context: "profile_completed",
        hints: {
          user_type: "new_user",
          entry_point: "app",
          has_profile: true,  // ✅ EXPLICIT - we just completed it!
          has_trip: !!user.tripId,  // ✅ EXPLICIT
          days_since_signup: user.createdAt ? 
            Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) : 0
        }
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
        console.error(`❌ Python response:`, pythonResponse.data);
      }
    } catch (pythonError) {
      // Don't fail profile update if Python service fails
      console.error(`❌ Failed to call Python for profile completion: ${user.email}`);
      console.error(`❌ Error details:`, {
        message: pythonError.message,
        code: pythonError.code,
        status: pythonError.response?.status,
        data: pythonError.response?.data
      });
      
      if (pythonError.code === 'ECONNREFUSED' || pythonError.code === 'ENOTFOUND') {
        console.error(`🚨 CRITICAL: Python service is not accessible at ${TRIPWELL_AI_BRAIN}`);
        console.error(`🔧 Check if Python service is running on Render`);
      }
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("🔥 Error updating profile:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
