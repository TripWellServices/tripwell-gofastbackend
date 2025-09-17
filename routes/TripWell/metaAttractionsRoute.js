const express = require("express");
const router = express.Router();
const MetaAttractions = require("../../models/TripWell/MetaAttractions");
const { getOrCreateCity } = require("../../services/TripWell/parseCityService");

/**
 * POST /tripwell/meta-attractions
 * Hydrates existing meta attractions from database
 * Meta attractions should already exist (generated during city creation)
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
    console.log("📋 Building content library for:", city, season);
    
    // Step 1: Get or create city using parseCityService
    const cityDoc = await getOrCreateCity(city);
    console.log("✅ City ready:", cityDoc.cityName, cityDoc._id);
    
    // Step 2: Get existing meta attractions (they should exist because city creation generates them)
    let metaAttractions = await MetaAttractions.findOne({ cityId: cityDoc._id, season });
    if (metaAttractions) {
      console.log("✅ Meta attractions found for city:", cityDoc.cityName);
      return res.json({
        status: "success",
        message: "Meta attractions loaded",
        cityId: cityDoc._id,
        metaAttractionsId: metaAttractions._id,
        metaAttractions: metaAttractions.metaAttractions,
        source: "content_library",
        nextStep: "Call build list service"
      });
    }
    
    // Step 3: If no meta attractions found, something went wrong
    console.log("❌ No meta attractions found for city:", cityDoc.cityName);
    return res.status(404).json({
      status: "error",
      message: "Meta attractions not found. City should have been created with meta attractions.",
      cityId: cityDoc._id,
      cityName: cityDoc.cityName
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