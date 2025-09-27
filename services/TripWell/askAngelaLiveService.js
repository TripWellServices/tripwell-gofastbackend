const { OpenAI } = require("openai");
const TripBase = require("../../models/TripWell/TripBase");
const TripCurrentDays = require("../../models/TripWell/TripCurrentDays");
const openai = new OpenAI();

/**
 * Handles live trip Q&A (Ask Angela).
 * Returns GPT answer string based on question + trip context.
 */
async function askAngelaLiveService({ tripId, dayIndex, blockName, question }) {
  if (!tripId || typeof dayIndex !== "number" || !question) {
    throw new Error("Missing required fields for Ask Angela");
  }

  const trip = await TripBase.findOne({ _id: tripId });
  if (!trip || !trip.city || !trip.startDate) {
    throw new Error("Trip not found or missing city/startDate");
  }

  const tripDay = await TripCurrentDays.findOne({ tripId, dayIndex });
  if (!tripDay) {
    throw new Error("TripCurrentDays not found");
  }

  // Compute day of week
  const tripStart = new Date(trip.startDate);
  const targetDate = new Date(tripStart);
  targetDate.setDate(tripStart.getDate() + (dayIndex - 1));
  const dayOfWeek = targetDate.toLocaleDateString("en-US", { weekday: "long" });

  // Optional block context
  const blockContext = blockName ? tripDay.blocks?.[blockName] : null;
  const blockDesc = blockContext?.desc ? `Block context: ${blockContext.desc}` : "";

  const systemPrompt = `
You are Angela, TripWell’s smart travel assistant.
You are helping a user currently on a trip in ${trip.city}.
Today is ${dayOfWeek}.
Answer the user's question clearly and briefly. You may recommend local spots or practical advice.

Do NOT repeat the question or explain your reasoning.
Do NOT use markdown.
`.trim();

  const userPrompt = `
Trip ID: ${tripId}
City: ${trip.city}
Day: ${dayOfWeek}
${blockDesc ? blockDesc + "\n" : ""}
User question:
"${question}"
`.trim();

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    temperature: 0.7,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]
  });

  const answer = response.choices?.[0]?.message?.content?.trim();
  if (!answer) throw new Error("No GPT answer received");

  return answer;
}

module.exports = { askAngelaLiveService };
