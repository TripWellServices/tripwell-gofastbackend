const { callOpenAI } = require("../../utils/openai");

async function participantHighlightsGPT(trip) {
  const city = trip.city || "your destination";
  const season = trip.season || "this time of year";
  const days = trip.daysTotal || 3;

  const prompt = `
You are Angela, a memory-first travel assistant.

The user is going on a ${days}-day trip to ${city} during ${season}.
Based on what this place offers that time of year, suggest 5 memorable highlights they might experience.

Format as:
[
  { "title": "Highlight Title", "desc": "One-sentence emotional description." },
  ...
]
`;

  try {
    const raw = await callOpenAI(prompt);
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.error("❌ Error calling or parsing GPT response:", err);
    return [];
  }
}

module.exports = participantHighlightsGPT;
