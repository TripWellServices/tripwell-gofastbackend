const express = require("express");
const router = express.Router();
const { generateMetaAttractions } = require("../../services/TripWell/metaAttractionsService");
const mongoose = require('mongoose');

/**
 * POST /tripwell/meta-attractions
 * Generates meta attractions and saves them to database
 * This is the second step in the separate call flow
 */

// Meta Attractions Schema
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
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Use existing connection or create model
let MetaAttractions;
try {
  MetaAttractions = mongoose.model('MetaAttractions');
} catch (error) {
  MetaAttractions = mongoose.model('MetaAttractions', MetaAttractionsSchema);
}

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
    
    let metaAttractions;
    try {
      metaAttractions = JSON.parse(metaAttractionsResult.rawResponse);
      console.log("✅ Meta attractions generated:", metaAttractions.length);
    } catch (parseError) {
      console.error("❌ Failed to parse meta attractions:", parseError);
      throw new Error(`Failed to parse meta attractions: ${parseError.message}`);
    }
    
    // Step 2: Save to database
    console.log("💾 Saving meta attractions to database...");
    
    const newMetaAttractions = new MetaAttractions({
      placeSlug,
      city,
      season,
      metaAttractions,
      status: 'meta_generated'
    });

    await newMetaAttractions.save();
    console.log("✅ Meta attractions saved:", newMetaAttractions._id);
    
    res.status(200).json({
      status: "success",
      message: "Meta attractions generated and saved successfully",
      placeSlug: placeSlug,
      metaAttractionsId: newMetaAttractions._id,
      metaAttractions: metaAttractions,
      nextStep: "Call build list service"
    });
    
  } catch (error) {
    console.error("🔥 Meta Attractions Error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to generate meta attractions"
    });
  }
});

module.exports = router;
