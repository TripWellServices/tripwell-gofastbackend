// tripwellUserRoute.js

const express = require("express");
const router = express.Router();
const TripWellUser = require("../../models/TripWellUser");
const axios = require("axios");

// Environment variables
const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL || "http://localhost:8000";
const TRIPWELL_AI_BRAIN = process.env.TRIPWELL_AI_BRAIN || "https://tripwell-ai.onrender.com";

router.post("/createOrFind", async (req, res) => {
  try {
    const { firebaseId, email, funnelStage } = req.body;

    if (!firebaseId || !email) {
      return res.status(400).json({ error: "Missing firebaseId or email" });
    }

    console.log("🔍 DEBUG - Searching for user with firebaseId:", firebaseId);
    let user = await TripWellUser.findOne({ firebaseId });
    console.log("🔍 DEBUG - User found:", user ? "YES" : "NO");
    if (user) {
      console.log("🔍 DEBUG - Found user:", { 
        _id: user._id, 
        firebaseId: user.firebaseId, 
        email: user.email,
        profileComplete: user.profileComplete 
      });
    }
    let isNewUser = false;

    if (!user) {
      // Create new user
      user = new TripWellUser({
        firebaseId,
        email,
        name: null,           // Legacy placeholder
        firstName: null,        // ✅ Profile field
        lastName: null,       // ✅ Profile field
        hometownCity: null,   // ✅ Profile field
        state: null,          // ✅ Profile field
        travelStyle: [],      // ✅ Profile field
        tripVibe: [],         // ✅ Profile field
        profileComplete: false, // ✅ Explicitly set to false for new users
        userStatus: "new", // ✅ Backend sets userStatus for new users
        tripId: null,
        role: "noroleset",    // Will be assigned later
        funnelStage: funnelStage || "none",  // Set funnel stage if provided
        // 🎯 NODE.JS MUTATES: Set initial state flags
        journeyStage: "new_user",
        userState: funnelStage && funnelStage !== "none" ? "demo_only" : "active"
      });

      await user.save();
      isNewUser = true;
      console.log(`✅ Created new user: ${email} (${firebaseId}) with funnelStage: ${user.funnelStage}`);
    } else if (funnelStage && user.funnelStage !== funnelStage) {
      // Update funnel stage if user is progressing
      user.funnelStage = funnelStage;
      await user.save();
    }

    // 🎯 Call Python for new user tracking and state management
    if (isNewUser) {
      try {
        console.log(`🎯 Calling Python for new user tracking: ${email}`);
        
        const pythonResponse = await axios.post(`${TRIPWELL_AI_BRAIN}/useactionendpoint`, {
          user_id: user._id,
          firebase_id: user.firebaseId,
          email: user.email,
          context: "new_user_signup",
          // Send user status data for tracking
          _id: user._id,
          firebaseId: user.firebaseId,
          journeyStage: user.journeyStage,
          userState: user.userState,
          userStage: user.userStage || "new_user",
          profileComplete: user.profileComplete || false
        });

        if (pythonResponse.status === 200) {
          const pythonData = pythonResponse.data;
          console.log(`✅ Python tracking complete for ${email}:`, {
            actions_taken: pythonData.actions_taken?.length || 0,
            user_state: pythonData.user_state
          });
        }
      } catch (pythonError) {
        console.error(`❌ Python tracking failed for ${email}:`, pythonError.message);
        // Don't fail the request if Python service fails
      }
    }

    return res.status(200).json({
      user: user.toObject()  // userStatus is the source of truth for routing
    });
  } catch (err) {
    console.error("❌ Error in createOrFind:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Update user's funnel stage
router.put("/updateFunnelStage", async (req, res) => {
  try {
    const { firebaseId, funnelStage } = req.body;
    
    if (!firebaseId || !funnelStage) {
      return res.status(400).json({ 
        success: false, 
        message: "firebaseId and funnelStage are required" 
      });
    }

    const validStages = ["none", "itinerary_demo", "spots_demo", "updates_only", "full_app"];
    if (!validStages.includes(funnelStage)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid funnel stage" 
      });
    }

    const updatedUser = await TripWellUser.findOneAndUpdate(
      { firebaseId },
      { funnelStage },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.json({ 
      success: true, 
      message: "Funnel stage updated successfully",
      user: updatedUser 
    });

  } catch (error) {
    console.error("Error updating funnel stage:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update funnel stage" 
    });
  }
});

// Exit funnel - upgrade user to full_app (for "Take me to the app" button)
router.put("/exitFunnel", async (req, res) => {
  try {
    const { firebaseId } = req.body;
    
    if (!firebaseId) {
      return res.status(400).json({ 
        success: false, 
        message: "firebaseId is required" 
      });
    }

    const updatedUser = await TripWellUser.findOneAndUpdate(
      { firebaseId },
      { funnelStage: 'full_app' },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.json({ 
      success: true, 
      message: "User exited funnel successfully",
      user: updatedUser 
    });

  } catch (error) {
    console.error("Error exiting funnel:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to exit funnel" 
    });
  }
});

// Complete onboarding - upgrade user from "none" to "full_app" (for profile completion)
router.put("/completeOnboarding", async (req, res) => {
  try {
    const { firebaseId } = req.body;
    
    if (!firebaseId) {
      return res.status(400).json({ 
        success: false, 
        message: "firebaseId is required" 
      });
    }

    const user = await TripWellUser.findOne({ firebaseId });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Only upgrade users who are in "none" stage (brand new users)
    if (user.funnelStage === "none") {
      user.funnelStage = "full_app";
      await user.save();
      
      console.log(`✅ User ${user.email} completed onboarding: none → full_app`);
      
      res.json({ 
        success: true, 
        message: "Onboarding completed successfully",
        user: user 
      });
    } else {
      res.json({ 
        success: true, 
        message: "User already completed onboarding or is in demo funnel",
        user: user 
      });
    }

  } catch (error) {
    console.error("Error completing onboarding:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to complete onboarding" 
    });
  }
});

module.exports = router;
