// tripwellUserRoute.js

const express = require("express");
const router = express.Router();
const TripWellUser = require("../../models/TripWell/TripWellUser");
const axios = require("axios");

// Environment variables
const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL || "http://localhost:8000";
const TRIPWELL_AI_BRAIN = process.env.TRIPWELL_AI_BRAIN || "https://tripwell-ai.onrender.com";

router.post("/createOrFind", async (req, res) => {
  try {
    const { firebaseId } = req.body;

    if (!firebaseId) {
      return res.status(400).json({ error: "Missing firebaseId" });
    }

    console.log("🔍 Checking for user with firebaseId:", firebaseId);
    
    // Find or create user by firebaseId only
    let user = await TripWellUser.findOne({ firebaseId });
    
    if (!user) {
      // Create new user with just firebaseId
      user = new TripWellUser({
        firebaseId
      });
      await user.save();
      console.log("✅ Created new user:", firebaseId);
    } else {
      console.log("✅ Found existing user:", firebaseId);
    }

    // Return simple response
    return res.status(200).json({
      success: true,
      firebaseId: user.firebaseId,
      userId: user._id
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
