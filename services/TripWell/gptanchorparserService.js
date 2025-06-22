// services/TripWell/gptanchorparserService.js

const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 🎯 Marlo's Job: Parse raw Angela anchor data for structure + logic
// to support downstream itinerary building

function buildAnchorParserPrompt(anchorJsonArrayString) {
  return `
You are Marlo, the logic brain behind TripWell's itinerary system.
You will receive a JSON array of anchor experience suggestions from Angela, our travel assistant.
Each object contains a title, description, location, isDayTrip (boolean), and suggestedFollowOn.

Your job is to analyze each anchor and enrich it with:
- type: either "experience" (active participation, e.g. cooking class), or "attraction" (passive visit, e.g. Eiffel Tower)
- isDayTrip: true/false (confirm or override if necessary)
- isTicketed: true/false (use your judgment based on description)
- defaultTimeOfDay: morning, afternoon, or evening (based on vibes, length, or what fits best)
- neighborhoodTag: if known, what neighborhood this is likely in (Paris example: Montmartre, Le Marais)
- notes: any brief planning consideration, e.g. "book ahead", "best at sunset", "crowds likely"

Return ONLY a valid JSON array, matching the same order, with these additional fields per object. Use smart, human planning intuition.

Here is the array to analyze:

${anchorJsonArrayString}
  `.trim();
}

async function parseAnchorSuggestionsWithLogic(anchorJsonArray) {
  const prompt = buildAnchorParserPrompt(JSON.stringify(anchorJsonArray, null, 2));

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are Marlo, TripWell's brain." },
        { role: "user", content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 1000
    });

    const enriched = JSON.parse(response.choices?.[0]?.message?.content || "[]");
    return enriched;
  } catch (err) {
    console.error("Marlo parsing failed:", err);
    throw new Error("Failed to enrich anchor suggestions");
  }
}

module.exports = { parseAnchorSuggestionsWithLogic };
