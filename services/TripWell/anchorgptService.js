// services/TripWell/anchorgptService.js
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
Who they’re traveling with: ${Array.isArray(whoWith) ? whoWith.join(", ") : whoWith || "unspecified"}

Traveler Preferences:
- Vibes: ${vibes?.join(", ") || "any"}
- Priorities: ${priorities?.join(", ") || "any"}
- Mobility: ${mobility?.join(", ") || "any"}
- Budget: ${budget || "flexible"}
- Travel pace: ${travelPace?.join(", ") || "any"}

Respond as an array of 5 JSON objects. Each object should have:
- title (string)
- description (string)
- location (string)
- isDayTrip (boolean)
- suggestedFollowOn (string) – how it shapes the rest of the day

Do **not** include markdown or explanations outside the array.
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
    season: tripBase.season, // ✅ source of truth now
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
