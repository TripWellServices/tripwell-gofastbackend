const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const { generateMetaAttractions } = require("../../services/TripWell/metaAttractionsService");
const { parsePlaceTodoData } = require("../../services/TripWell/placetodoSaveService");

// CityProfile Schema - Index for each city
const CityProfileSchema = new mongoose.Schema({
  city: { type: String, required: true, unique: true },
  country: { type: String, required: true },
  cityProfileId: { type: String, required: true, unique: true },
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

// MetaAttractions Schema - Indexed by city (reusable)
const MetaAttractionsSchema = new mongoose.Schema({
  cityProfileId: { type: String, required: true, unique: true },
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

const CityProfile = mongoose.model('CityProfile', CityProfileSchema);
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
    
    // Step 1: Get or create city profile
    const cityProfileId = `${city}Profile`;
    let cityProfile = await CityProfile.findOne({ city });
    if (!cityProfile) {
      cityProfile = new CityProfile({
        city,
        country: "Unknown", // TODO: Add country detection
        cityProfileId
      });
      await cityProfile.save();
      console.log("✅ City profile created:", cityProfileId);
    } else {
      console.log("✅ City profile found:", cityProfileId);
    }
    
    // Step 2: Check if meta attractions already exist for this city/season
    let metaAttractions = await MetaAttractions.findOne({ cityProfileId, season });
    if (metaAttractions) {
      console.log("✅ Meta attractions already exist for", city, season);
      return res.json({
        status: "success",
        message: "Meta attractions already exist",
        cityProfileId,
        metaAttractionsId: metaAttractions._id,
        metaAttractions: metaAttractions.metaAttractions,
        nextStep: "Call build list service"
      });
    }
    
    // Step 3: Generate new meta attractions
    const metaAttractionsResult = await generateMetaAttractions({ city, season });
    console.log("✅ GPT meta attractions generated");
    
    // Step 4: Use the parsed data directly (following existing pattern)
    const metaAttractionsData = metaAttractionsResult.data;
    console.log("✅ Meta attractions generated:", metaAttractionsData.length);
    console.log("🔍 Meta attractions type:", typeof metaAttractionsData);
    console.log("🔍 Meta attractions is array:", Array.isArray(metaAttractionsData));
    
    // Step 5: Save to database
    const newMetaAttractions = new MetaAttractions({
      cityProfileId,
      city,
      season,
      metaAttractions: metaAttractionsData,
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