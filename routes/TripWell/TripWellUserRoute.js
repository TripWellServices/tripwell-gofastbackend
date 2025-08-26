// tripwellUserRoute.js

const express = require("express");
const router = express.Router();
const TripWellUser = require("../../models/TripWellUser");

router.post("/createOrFind", async (req, res) => {
  try {
    const { firebaseId, email, funnelStage } = req.body;

    if (!firebaseId || !email) {
      return res.status(400).json({ error: "Missing firebaseId or email" });
    }

    let user = await TripWellUser.findOne({ firebaseId });

    if (!user) {
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
    } else if (funnelStage && user.funnelStage !== funnelStage) {
      // Update funnel stage if user is progressing
      user.funnelStage = funnelStage;
      await user.save();
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

module.exports = router;
