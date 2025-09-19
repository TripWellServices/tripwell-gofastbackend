const OpenAI = require("openai");
const MetaAttractions = require("../../models/TripWell/MetaAttractions");
const TripBase = require("../../models/TripWell/TripBase");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🧠 GPT prompt builder for persona samples
function buildSamplePrompt({ city, season, purpose, whoWith, primaryPersona, budget, travelPace, metaAttractions }) {
  return `
You are Angela, TripWell's smart travel planner.

Generate 6 persona learning samples for a traveler going to **${city}** during **${season}**.
Purpose: ${purpose || "to explore and enjoy"}
Travel companions: ${whoWith || "unspecified"}
Primary persona: ${primaryPersona}
Budget: $${budget} per day
Travel pace: ${travelPace}

**Meta Attractions Available:**
${metaAttractions.map(attraction => `- ${attraction.name}: ${attraction.description}`).join('\n')}

**Task:** Create 6 samples (2 attractions, 2 restaurants, 2 neat things) that will help me learn the traveler's preferences. Each sample should be personalized based on their primary persona (${primaryPersona}) and travel style.

**Format:** Return only a JSON array with 6 objects, each containing:
- type: "attraction" | "restaurant" | "neat_thing"
- name: string
- description: string
- location: string
- why_recommended: string (explain why this matches their ${primaryPersona} persona)

**Important:** 
- Make samples diverse and interesting
- Avoid the generic meta attractions listed above
- Focus on local, authentic experiences
- Each recommendation should teach us something about their preferences

Return only the raw JSON array. No explanations or markdown.
`.trim();
}

// 🤖 Main GPT sample generation service
async function generatePersonaSamples({ tripId, userId }) {
  if (!tripId || !userId) throw new Error("Missing tripId or userId");

  console.log("🔍 Generating persona samples for:", { tripId, userId });

  // Get trip data and meta attractions from database
  const tripBase = await TripBase.findById(tripId);
  if (!tripBase) throw new Error("Trip not found");

  const metaAttractions = await MetaAttractions.findOne({ cityId: tripBase.cityId });
  if (!metaAttractions) throw new Error("Meta attractions not found for this city");

  console.log("🔍 Found meta attractions:", metaAttractions.metaAttractions.length);

  // Use the data from database
  const prompt = buildSamplePrompt({
    city: tripBase.city,
    season: tripBase.season, 
    purpose: tripBase.purpose || "to explore and enjoy",
    whoWith: tripBase.whoWith,
    primaryPersona: "art", // This should come from TripPersona model
    budget: 250, // This should come from TripPersona model
    travelPace: "moderate", // This should come from TripPersona model
    metaAttractions: metaAttractions.metaAttractions
  });

  try {
    console.log("🧪 Calling OpenAI for persona samples...");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are Angela, TripWell's assistant." },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 800
    });

    const parsed = JSON.parse(response.choices?.[0]?.message?.content || "[]");
    console.log("✅ OpenAI call successful! Got samples:", parsed.length);

    return {
      samples: parsed,
      raw: response
    };
  } catch (err) {
    console.error("❌ OpenAI call failed:", err);
    throw new Error("Failed to generate persona samples");
  }
}

module.exports = { generatePersonaSamples };
