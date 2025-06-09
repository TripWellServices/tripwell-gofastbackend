const { Configuration, OpenAIApi } = require("openai");
const TripGPT = require("../../models/TripWell/TripGPT");

// 🔥 Just do this directly
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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

  const response = await openai.createCompletion({
    model: "text-davinci-003", // or gpt-4 if you're enabled
    prompt,
    max_tokens: 300,
    temperature: 0.7,
  });

  const gptReply = response.data.choices[0].text.trim();

  const savedReply = await TripGPT.create({
    tripId,
    userId,
    gptReply,
    parsed: {}, // leave open for future
  });

  return {
    gptReply,
    replyId: savedReply._id,
  };
}

module.exports = { handleTripGPTReply };
