const express = require("express");
const router = express.Router();
const TripPersona = require("../../models/TripWell/TripPersona");
const TripBase = require("../../models/TripWell/TripBase");
const { saveTripPersonaCalculations } = require("../../services/tripPersonaCalculationService");

/**
 * POST /tripwell/trip-persona
 * Create or update trip persona data
 */
router.post("/trip-persona", async (req, res) => {
  try {
    console.log("🎭 TRIP PERSONA ROUTE HIT!");
    console.log("🎭 Body:", req.body);
    
    const { tripId, userId, primaryPersona, budget, dailySpacing } = req.body;

    if (!tripId || !userId || !primaryPersona || !budget || !dailySpacing) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields: tripId, userId, primaryPersona, budget, dailySpacing"
      });
    }

    console.log("📋 Creating/updating trip persona for:", { tripId, userId, primaryPersona });

    // Budget level can be calculated from budget when needed

    // Use TripPersona calculation service for clean weight calculation
    console.log("🧮 Calculating trip persona weights with service...");
    
    const tripPersonaData = { primaryPersona, budget, dailySpacing };
    const tripPersona = await saveTripPersonaCalculations(tripId, userId, tripPersonaData);
    
    console.log("✅ Trip persona weights calculated and saved");

    console.log("✅ TripPersona saved:", {
      id: tripPersona._id,
      primaryPersona: tripPersona.primaryPersona,
      budget: tripPersona.budget,
      dailySpacing: tripPersona.dailySpacing
    });

    res.json({
      status: "success",
      message: "TripPersona created/updated successfully",
      tripId,
      userId,
      persona: tripPersona,
      nextStep: "Navigate to /meta-select"
    });

  } catch (error) {
    console.error("❌ TripPersona creation/update failed:", error);
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
});

/**
 * GET /tripwell/trip-persona/:tripId/:userId
 * Get trip persona data
 */
router.get("/trip-persona/:tripId/:userId", async (req, res) => {
  try {
    const { tripId, userId } = req.params;
    
    console.log("🔍 Fetching TripPersona for:", { tripId, userId });
    
    const tripPersona = await TripPersona.findOne({ tripId, userId });
    
    if (!tripPersona) {
      return res.status(404).json({
        status: "error",
        message: "TripPersona not found"
      });
    }

    console.log("✅ TripPersona found:", tripPersona);
    
    res.json({
      status: "success",
      persona: tripPersona
    });

  } catch (error) {
    console.error("❌ TripPersona fetch failed:", error);
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
});

module.exports = router;
