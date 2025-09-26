const OpenAI = require("openai");
const { getLLMReadyData } = require("../llmHydrateService");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🧠 GPT prompt builder for persona samples using LLM-ready data
function buildSamplePrompt(llmData) {
  const { 
    city, season, purpose,
    tripPersonaLLM, tripBudgetLLM, tripSpacingLLM,
    dominantPersona, dominantBudget
  } = llmData;
  
  return `
Generate exactly 6 curated samples for ${city} based on the user's persona:

**User Persona:**
${tripPersonaLLM}

**Budget Level:**
${dominantBudget} - ${tripBudgetLLM}

**Travel Style:**
${tripSpacingLLM}

**Trip Context:**
- Destination: ${city}
- Season: ${season}
- Purpose: ${purpose}

**Instructions:**
Generate exactly 6 curated samples:
1. 2 Attractions (tagged by persona)
2. 2 Restaurants (tagged by persona) 
3. 2 Neat Things (not meta attractions, tagged by persona)

Return a JSON object with this exact structure:
{
  "attractions": [
    { "id": "attr_1", "name": "Attraction Name", "description": "Brief description" }
  ],
  "restaurants": [
    { "id": "rest_1", "name": "Restaurant Name", "description": "Brief description" }
  ],
  "neatThings": [
    { "id": "neat_1", "name": "Neat Thing Name", "description": "Brief description" }
  ]
}

Rules:
- Focus on the user's ${dominantPersona} persona preferences
- Consider ${dominantBudget} budget level
- Avoid obvious tourist attractions
- Make descriptions engaging but brief
- Ensure variety across the 6 samples
- Consider seasonal appropriateness (${season})
- Keep the response clean - only include name and description

Return only the JSON object. No explanations, markdown, or extra commentary.
`.trim();
}

// 🤖 Main GPT sample generation service using LLM-ready data
async function generatePersonaSamples({ tripId, userId }) {
  if (!tripId || !userId) throw new Error("Missing tripId or userId");

  console.log("🔍 Generating persona samples for:", { tripId, userId });

  try {
    // Get LLM-ready data (ONE source of truth)
    const llmData = await getLLMReadyData(tripId);
    console.log("✅ Got LLM-ready data for samples generation");

    // Build prompt using LLM-ready data
    const prompt = buildSamplePrompt(llmData);

    console.log("🧪 Calling OpenAI for persona samples...");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are Angela, TripWell's assistant. Return structured JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 800
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) throw new Error("No GPT output received.");

    let samplesData;
    try {
      samplesData = JSON.parse(content);
    } catch (error) {
      // Handle malformed JSON (single quotes, etc.)
      const jsonString = content.replace(/'/g, '"');
      samplesData = JSON.parse(jsonString);
    }

    console.log("✅ OpenAI call successful! Got samples:", {
      attractions: samplesData.attractions?.length || 0,
      restaurants: samplesData.restaurants?.length || 0,
      neatThings: samplesData.neatThings?.length || 0
    });

    return {
      samples: samplesData,
      raw: response,
      llmData: llmData // Include LLM data for metadata
    };
  } catch (err) {
    console.error("❌ OpenAI call failed:", err);
    throw new Error("Failed to generate persona samples");
  }
}

module.exports = { generatePersonaSamples };
