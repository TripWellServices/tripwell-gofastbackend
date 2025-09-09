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

    let user = await TripWellUser.findOne({ firebaseId });
    let isNewUser = false;

    if (!user) {
      // Create new user
      user = new TripWellUser({
        firebaseId,
        email,
        name: null,           // Legacy placeholder
        firstName: null,      // ✅ Profile field
        lastName: null,       // ✅ Profile field
        hometownCity: null,   // ✅ Profile field
        state: null,          // ✅ Profile field
        travelStyle: [],      // ✅ Profile field
        tripVibe: [],         // ✅ Profile field
        tripId: null,
        role: "noroleset",    // Will be assigned later
        funnelStage: funnelStage || "none"  // Set funnel stage if provided
      });

      await user.save();
      isNewUser = true;
      console.log(`✅ Created new user: ${email} (${firebaseId}) with funnelStage: ${user.funnelStage}`);
    } else if (funnelStage && user.funnelStage !== funnelStage) {
      // Update funnel stage if user is progressing
      user.funnelStage = funnelStage;
      await user.save();
    }

    // 🎯 NEW: Call Python Main Service for clean architecture analysis
    if (isNewUser) {
      try {
        console.log(`🎯 Calling Python Main Service for new user: ${email}`);
        
        const mainServiceResponse = await axios.post(`${TRIPWELL_AI_BRAIN}/analyze-user`, {
          user_id: user._id.toString(), // Send the MongoDB _id
          firebase_id: firebaseId,
          email: email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileComplete: user.profileComplete,
          tripId: user.tripId,
          funnelStage: user.funnelStage,
          createdAt: user.createdAt,
          context: "new_user_signup", // ✅ Tell Python this is a new user
          hints: {
            user_type: "new_user",
            entry_point: funnelStage === "none" ? "signup" : "demo",
            days_since_signup: 0,
            has_profile: false,
            has_trip: false
          }
        }, {
          timeout: 15000, // Give Python more time to analyze
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (mainServiceResponse.data.success) {
          console.log(`✅ Main Service analysis complete for ${email}:`, {
            actions_taken: mainServiceResponse.data.actions_taken.length,
            user_state: mainServiceResponse.data.user_state
          });
          
          // Log each action taken
          mainServiceResponse.data.actions_taken.forEach(action => {
            console.log(`  📧 ${action.campaign}: ${action.status} - ${action.reason}`);
          });
        } else {
          console.error(`❌ Main Service analysis failed for ${email}`);
        }
      } catch (mainServiceError) {
        // Don't fail user creation if Python service fails
        console.error(`❌ Failed to call Main Service for ${email}:`, mainServiceError.message);
        
        // Fallback to old email service for welcome emails only
        if (!funnelStage || funnelStage === "none") {
          try {
            const name = email.split('@')[0];
            console.log(`📧 Fallback: Sending welcome email to new user: ${email}`);
            
            const emailResponse = await axios.post(`${EMAIL_SERVICE_URL}/emails/welcome`, {
              email: email,
              name: name
            }, {
              timeout: 10000,
              headers: {
                'Content-Type': 'application/json'
              }
            });

            if (emailResponse.data.status === "sent") {
              console.log(`✅ Fallback welcome email sent successfully to ${email}`);
            }
          } catch (fallbackError) {
            console.error(`❌ Fallback email also failed for ${email}:`, fallbackError.message);
          }
        }
      }
    }

    return res.status(200).json(user);
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
