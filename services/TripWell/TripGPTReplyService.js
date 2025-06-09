const OpenAI = require("openai");
const TripGPT = require("../../models/TripWell/TripGPT");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

async function handleTripGPTReply({ tripId, userId, userInput }) {
  if (!userInput || !tripId) throw new Error("Missing input or tripId");

  const prompt = buildPrompt({ userInput, tripId, userId });

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo", // or "gpt-4"
    messages: [
      { role: "system", content: "You are TripWell AI." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 300,
  });

  const gptReply = response.choices[0].message.content.trim();

  const savedReply = await TripGPT.create({
    tripId,
    userId,
    gptReply,
    parsed: {},
  });

  return {
    gptReply,
    replyId: savedReply._id,
  };
}

module.exports = { handleTripGPTReply };
