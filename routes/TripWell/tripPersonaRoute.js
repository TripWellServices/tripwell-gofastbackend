const express = require("express");
const router = express.Router();
const TripPersona = require("../../models/TripWell/TripPersona");
const TripBase = require("../../models/TripWell/TripBase");

/**
 * POST /tripwell/trip-persona
 * Create or update trip persona data
 */
router.post("/trip-persona", async (req, res) => {
  try {
    console.log("🎭 TRIP PERSONA ROUTE HIT!");
    console.log("🎭 Body:", req.body);
    
    const { tripId, userId, primaryPersona, budget, whoWith, romanceLevel, caretakerRole, flexibility } = req.body;

    if (!tripId || !userId || !primaryPersona || !budget || !whoWith) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields: tripId, userId, primaryPersona, budget, whoWith"
      });
    }

    console.log("📋 Creating/updating trip persona for:", { tripId, userId, primaryPersona });

    // Check if TripPersona already exists
    let tripPersona = await TripPersona.findOne({ tripId, userId });
    
    if (tripPersona) {
      console.log("🔍 Updating existing TripPersona");
      // Update existing persona
      tripPersona.primaryPersona = primaryPersona;
      tripPersona.budget = budget;
      tripPersona.whoWith = whoWith;
      tripPersona.romanceLevel = romanceLevel || 0.0;
      tripPersona.caretakerRole = caretakerRole || 0.0;
      tripPersona.flexibility = flexibility || 0.7;
      tripPersona.status = 'created';
      await tripPersona.save();
    } else {
      console.log("🔍 Creating new TripPersona");
      // Create new persona - the pre-save middleware will calculate weights
      tripPersona = await TripPersona.create({
        tripId,
        userId,
        primaryPersona,
        budget,
        whoWith,
        romanceLevel: romanceLevel || 0.0,
        caretakerRole: caretakerRole || 0.0,
        flexibility: flexibility || 0.7
      });
    }

    console.log("✅ TripPersona saved:", {
      id: tripPersona._id,
      primaryPersona: tripPersona.primaryPersona,
      personas: tripPersona.personas,
      romanceLevel: tripPersona.romanceLevel,
      caretakerRole: tripPersona.caretakerRole,
      flexibility: tripPersona.flexibility
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
