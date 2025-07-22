// services/TripWell/participantHighlightsGPTService.js

const { callOpenAI } = require("../../utils/openai");

async function participantHighlightsGPT(trip, intent) {
  const city = trip.city || "your destination";
  const days = trip.daysTotal || 3;
  const whoWith = intent.whoWith || "your group";
  const vibes = (intent.vibes || []).join(", ") || "fun and adventure";
  const pace = intent.travelPace || "relaxed";
  const budget = intent.budget || "moderate";

  const prompt = `
You are Angela, a memory-first travel assistant.

The user is going on a ${days}-day trip to ${city}.
They’re traveling with: ${whoWith}
Their vibe priorities: ${vibes}
They prefer a ${pace} travel style with a ${budget} budget.

Suggest 5 memorable experience highlights for them.
Format as:
[
  { "title": "Highlight Title", "desc": "One-sentence emotional description." },
  ...
]
`;

  const raw = await callOpenAI(prompt);

  try {
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.error("❌ Error parsing GPT response:", err);
    return [];
  }
}

module.exports = participantHighlightsGPT;
