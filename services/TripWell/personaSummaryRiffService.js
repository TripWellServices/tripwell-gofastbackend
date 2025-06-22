// /services/TripWell/personaSummaryRiffService.js

const { OpenAI } = require("openai");
const openai = new OpenAI();

async function generatePersonaSummary(tripIntent, tripBase) {
  if (!tripIntent || !tripBase) {
    throw new Error("TripIntent and TripBase are required to generate persona summary.");
  }

  const prompt = `
You're Marlo, a logic-driven assistant for an AI travel planner named Angela.

Your job is to interpret the user's travel intent and logistics and generate a 3-5 sentence summary
that captures the personality, tone, and style of this trip.

Angela will use your summary to shape the emotional arc, energy pacing, and time-of-day emphasis
when designing a personalized itinerary.

Write your output in natural language as if briefing a human planner. Don't quote the input fields —
interpret them into intuitive phrasing.

TripIntent:
${JSON.stringify(tripIntent, null, 2)}

TripBase:
${JSON.stringify(tripBase, null, 2)}

Respond with only the summary.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content:
          "You are Marlo, a logical AI who translates travel data into human-readable summaries for an itinerary planner.",
      },
      { role: "user", content: prompt },
    ],
  });

  const summary = completion.choices?.[0]?.message?.content?.trim();

  if (!summary) throw new Error("Failed to generate persona summary from Marlo.");

  return summary;
}

module.exports = { generatePersonaSummary };
