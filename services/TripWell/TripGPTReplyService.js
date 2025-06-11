const OpenAI = require("openai");
const mongoose = require("mongoose");
const TripAsk = require("../../models/TripWell/TripAsk");
const TripGPTRaw = require("../../models/TripWell/TripGPTRaw");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🧠 Build the GPT prompt
function buildPrompt({ userInput, tripId, userId }) {
  return `
You are TripWell AI, a smart assistant helping plan amazing trips.
User ${userId || "anonymous"} is asking about Trip ${tripId}.

Here’s what they said:
"""
${userInput}
"""

Reply with creative, specific ideas that match their vibe.
`.trim();
}

// 🤖 Run GPT and save raw response
async function handReply({ tripId, userId }) {
  if (!tripId || !userId) throw new Error("Missing tripId or userId");

  const tripObjectId = new mongoose.Types.ObjectId(tripId);

  const latestAsk = await TripAsk.findOne({ tripId: tripObjectId, userId }).sort({ timestamp: -1 });
  if (!latestAsk || !latestAsk.userInput) {
    throw new Error("No userInput found in TripAsk");
  }

  const prompt = buildPrompt({ userInput: latestAsk.userInput, tripId, userId });

  const response = await openai.chat.completions.create({
    model: "gpt-4", // or "gpt-3.5-turbo"
    messages: [
      { role: "system", content: "You are TripWell AI." },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 300,
  });

  // 🔒 Convert to plain JSON to avoid Mongoose issues
  const plainResponse = JSON.parse(JSON.stringify(response));

  const freeze = await TripGPTRaw.create({
    tripId: tripObjectId,
    userId,
    request: { prompt },
    response: plainResponse,
    timestamp: new Date(),
  });

  return {
    gptReply: plainResponse.choices?.[0]?.message?.content?.trim(),
    rawId: freeze._id,
  };
}

module.exports = { handReply };
