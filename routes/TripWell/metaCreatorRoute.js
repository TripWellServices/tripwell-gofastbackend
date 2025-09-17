const express = require("express");
const router = express.Router();
const { OpenAI } = require("openai");

const openai = new OpenAI();

/**
 * POST /tripwell/meta-creator
 * Creates meta attractions using OpenAI
 * This is the first step - just generates the attractions
 */
router.post("/meta-creator", async (req, res) => {
  console.log("🎯 META CREATOR ROUTE HIT!");
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
    console.log("🔄 Generating meta attractions for:", city, season);
    
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
      temperature: 0.3
    });

    const content = completion.choices[0].message.content || "[]";
    console.log("✅ GPT meta attractions generated");
    
    return res.status(200).json({
      status: "success",
      message: "Meta attractions generated successfully",
      placeSlug,
      city,
      season,
      rawResponse: content,
      nextStep: "Call meta-parse-and-save to save to database"
    });

  } catch (error) {
    console.error("❌ Meta creator error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to generate meta attractions",
      error: error.message
    });
  }
});

module.exports = router;
