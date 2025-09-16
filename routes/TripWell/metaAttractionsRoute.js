const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const { generateMetaAttractions } = require("../../services/TripWell/metaAttractionsService");
const { parsePlaceTodoData } = require("../../services/TripWell/placetodoSaveService");

// MetaAttractions Schema
const MetaAttractionsSchema = new mongoose.Schema({
  placeSlug: { type: String, required: true, unique: true },
  city: { type: String, required: true },
  season: { type: String, required: true },
  metaAttractions: [{
    name: String,
    type: String,
    reason: String
  }],
  status: { type: String, default: 'meta_generated' },
  createdAt: { type: Date, default: Date.now }
});

const MetaAttractions = mongoose.model('MetaAttractions', MetaAttractionsSchema);

/**
 * POST /tripwell/meta-attractions
 * Generates meta attractions and saves them to database
 * This is the second step in the separate call flow
 */

router.post("/meta-attractions", async (req, res) => {
  console.log("🎯 META ATTRACTIONS ROUTE HIT!");
  console.log("🎯 Body:", req.body);
  
  const { placeSlug, city, season } = req.body;

  // Validate input
  if (!placeSlug || !city || !season) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields: placeSlug, city, season"
    });
  }

  try {
    console.log("📋 Generating meta attractions for:", city, season);
    
    // Step 1: Generate meta attractions
    const metaAttractionsResult = await generateMetaAttractions({ city, season });
    console.log("✅ GPT meta attractions generated");
    
    // Step 2: Use the parsed data directly (following existing pattern)
    const metaAttractions = metaAttractionsResult.data;
    console.log("✅ Meta attractions generated:", metaAttractions.length);
    
    // Step 3: Save to database
    const newMetaAttractions = new MetaAttractions({
      placeSlug,
      city,
      season,
      metaAttractions,
      status: 'meta_generated'
    });
    
    await newMetaAttractions.save();
    console.log("✅ Meta attractions saved to database");
    
    res.json({
      status: "success",
      message: "Meta attractions generated and saved successfully",
      placeSlug,
      metaAttractionsId: newMetaAttractions._id,
      metaAttractions: metaAttractions,
      nextStep: "Call build list service"
    });
    
  } catch (error) {
    console.error("❌ Meta attractions generation failed:", error);
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
});

module.exports = router;