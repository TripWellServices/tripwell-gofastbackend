const OpenAI = require("openai");
const mongoose = require("mongoose");

const TripIntent = require("../../models/TripWell/TripIntent");
const TripBase = require("../../models/TripWell/TripBase");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🧠 GPT prompt builder
function buildAnchorPrompt({ vibes, priorities, mobility, travelPace, budget, city, season, purpose, whoWith }) {
  return `
You are Angela, TripWell’s smart travel planner.

Suggest 5 immersive travel *anchor experiences* based on the traveler’s input. Anchor experiences are major parts of a trip — like a full-day excursion, iconic site visit, or themed cultural activity — that shape the rest of the day.

Traveler is going to **${city}** during **${season}**.  
Purpose of trip: ${purpose || "not specified"}  
Travel companions: ${Array.isArray(whoWith) ? whoWith.join(", ") : whoWith || "unspecified"}

Traveler Priorities:
The traveler emphasized these top trip priorities: **${priorities?.join(", ") || "no specific priorities"}**.  
Please scope your anchor suggestions around these interests.

Trip Vibe:
The intended vibe is **${vibes?.join(", ") || "flexible"}** — reflect this in the tone and energy of the experiences you suggest (e.g., romantic vs. playful, high-energy vs. relaxed).

Mobility & Travel Pace:
The traveler prefers to get around via **${mobility?.join(", ") || "any mode"}**.  
Please suggest anchors and follow-ons that are realistically accessible based on that. Avoid experiences that would require conflicting transportation methods.  
Preferred travel pace: **${travelPace?.join(", ") || "any"}**.

Budget Guidance:
The expected daily budget is **${budget || "flexible"}**.  
Structure your anchor experiences and follow-on suggestions to reflect that — i.e., a lower budget may favor local food tours or free cultural sites, while a higher budget may justify guided excursions or upscale experiences.

Respond only with an array of 5 JSON objects. Each object should contain:
- title (string)
- description (string)
- location (string)
- isDayTrip (boolean)
- suggestedFollowOn (string) – what the rest of the day looks like after this anchor

Return only the raw JSON array. No explanations, markdown, or extra commentary.
`.trim();
}

// 🤖 Main GPT anchor suggestion service
async function generateAnchorSuggestions({ tripId, userId }) {
  if (!tripId || !userId) throw new Error("Missing tripId or userId");

  const tripObjectId = new mongoose.Types.ObjectId(tripId);

  const tripIntent = await TripIntent.findOne({ tripId: tripObjectId, userId });
  const tripBase = await TripBase.findOne({ userId, _id: tripObjectId });

  if (!tripIntent || !tripBase) throw new Error("Missing trip data");

  const prompt = buildAnchorPrompt({
    ...tripIntent.toObject(),
    city: tripBase.city,
    season: tripBase.season,
    purpose: tripBase.purpose,
    whoWith: tripBase.whoWith,
  });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are Angela, TripWell’s assistant." },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 600
    });

    const parsed = JSON.parse(response.choices?.[0]?.message?.content || "[]");

    return {
      anchors: parsed,
      raw: response
    };
  } catch (err) {
    console.error("Anchor GPT failed:", err);
    throw new Error("Failed to generate anchor suggestions");
  }
}

module.exports = { generateAnchorSuggestions };
