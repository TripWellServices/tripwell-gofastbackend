const express = require("express");
const router = express.Router();
const gpt = require("../../config/openai");

/**
 * POST /Tripwell/profile-gpt
 * Calls GPT to generate profile content based on user variables
 */
router.post("/profile-gpt", async (req, res) => {
  const { profileSlug, inputVariables } = req.body;

  // Validate input
  if (!profileSlug || !inputVariables) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields: profileSlug, inputVariables"
    });
  }

  if (!gpt) {
    return res.status(500).json({
      status: "error",
      message: "GPT not configured"
    });
  }

  try {
    // Build Angela prompt for profile content generation
    const prompt = `
You are Angela, TripWell's smart travel planner.

Generate personalized travel content for this traveler profile. Based on their preferences, suggest attractions, restaurants, and must-see experiences.

Traveler is going to **${inputVariables.city}** during **${inputVariables.season}**.  
Purpose of trip: ${inputVariables.purpose || "not specified"}  
Travel companions: ${Array.isArray(inputVariables.whoWith) ? inputVariables.whoWith.join(", ") : inputVariables.whoWith || "unspecified"}

Traveler Priorities:
The traveler emphasized these top trip priorities: **${inputVariables.priorities?.join(", ") || "no specific priorities"}**.  
Please scope your suggestions around these interests.

Trip Vibe:
The intended vibe is **${inputVariables.vibes?.join(", ") || "flexible"}** — reflect this in the tone and energy of the experiences you suggest (e.g., romantic vs. playful, high-energy vs. relaxed).

Mobility & Travel Pace:
The traveler prefers to get around via **${inputVariables.mobility?.join(", ") || "any mode"}**.  
Please suggest experiences that are realistically accessible based on that. Avoid experiences that would require conflicting transportation methods.  
Preferred travel pace: **${inputVariables.travelPace?.join(", ") || "any"}**.

Budget Guidance:
The expected daily budget is **${inputVariables.budget || "flexible"}**.  
Structure your suggestions to reflect that — i.e., a lower budget may favor local food tours or free cultural sites, while a higher budget may justify guided excursions or upscale experiences.

Respond only with a JSON object containing:
- attractions: array of 5-7 attractions with { name, description, location, cost }
- restaurants: array of 3-5 restaurants with { name, description, location, priceRange }
- mustSee: array of 3-5 must-see experiences with { name, description, location, cost }
- mustDo: array of 3-5 must-do experiences with { name, description, location, cost }

Return only the raw JSON object. No explanations, markdown, or extra commentary.
`.trim();

    // Call GPT with Angela prompt
    const completion = await gpt.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are Angela, TripWell's travel assistant. Return structured JSON only. No prose. No markdown."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8
    });

    const responseText = completion.choices[0].message.content;

    // Return raw response for parser to handle
    res.status(200).json({
      status: "ok",
      profileSlug: profileSlug,
      rawResponse: responseText
    });

  } catch (error) {
    console.error("GPT call error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "GPT call failed"
    });
  }
});

module.exports = router;
