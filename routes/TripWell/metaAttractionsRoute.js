const express = require("express");
const router = express.Router();
const { OpenAI } = require("openai");
const City = require("../../models/TripWell/City");
const MetaAttractions = require("../../models/TripWell/MetaAttractions");
const { getOrCreateCity } = require("../../services/TripWell/parseCityService");

const openai = new OpenAI();

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
    console.log("📋 Building content library for:", city, season);
    
    // Step 1: Get or create city using parseCityService
    const cityDoc = await getOrCreateCity(city);
    console.log("✅ City ready:", cityDoc.cityName, cityDoc._id);
    
    // Step 2: Check if meta attractions already exist for this city/season
    let metaAttractions = await MetaAttractions.findOne({ cityId: cityDoc._id, season });
    if (metaAttractions) {
      console.log("✅ Using saved meta attractions from content library");
      return res.json({
        status: "success",
        message: "Meta attractions loaded from content library",
        cityId: cityDoc._id,
        metaAttractionsId: metaAttractions._id,
        metaAttractions: metaAttractions.metaAttractions,
        source: "saved_library",
        nextStep: "Call build list service"
      });
    }
    
    // Step 3: Generate new meta attractions using GPT (not in content library yet)
    console.log("🔄 Generating new meta attractions (not in content library)");
    const systemPrompt = `You are Angela, TripWell's smart travel planner. Generate the "obvious" tourist attractions for ${city} in ${season}.

These are the generic, touristy, "everyone goes here" attractions that we want to AVOID in our personalized recommendations.

Return a JSON array of 8-12 obvious attractions with this structure:
[
  {
    "name": "Eiffel Tower",
    "type": "landmark",
    "reason": "Most iconic symbol of the city"
  },
  {
    "name": "Louvre Museum", 
    "type": "museum",
    "reason": "World's largest art museum"
  }
]

Focus on the most obvious, touristy, generic attractions that every travel guide mentions.

Return only the JSON array. No explanations, markdown, or extra commentary.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "You are Angela, TripWell's travel assistant. Return structured JSON only. No prose. No markdown." 
        },
        { role: "user", content: systemPrompt }
      ],
      temperature: 0.3,
      timeout: 30000
    });

    const content = completion.choices[0].message.content || "[]";
    console.log("✅ GPT meta attractions generated");
    
    // Step 4: Parse the JSON response
    let metaAttractionsData;
    try {
      metaAttractionsData = JSON.parse(content);
    } catch (error) {
      // If JSON parsing fails, try converting single quotes to double quotes
      const jsonString = content.replace(/'/g, '"');
      metaAttractionsData = JSON.parse(jsonString);
    }
    
    console.log("✅ Meta attractions parsed:", metaAttractionsData.length);
    
    // Step 5: Save to content library for future use
    const newMetaAttractions = new MetaAttractions({
      cityId: cityDoc._id,
      cityName: city,
      season,
      metaAttractions: metaAttractionsData
    });
    
    await newMetaAttractions.save();
    console.log("✅ Meta attractions saved to content library");
    
    res.json({
      status: "success",
      message: "Meta attractions generated and saved to content library",
      placeSlug,
      cityId: cityDoc._id,
      metaAttractionsId: newMetaAttractions._id,
      metaAttractions: metaAttractionsData,
      source: "newly_generated",
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