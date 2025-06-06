const TripGPT = require("../../models/TripWell/TripGPT");
const { callGPT } = require("../../utils/gptHelper");

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
  const gptReply = await callGPT(prompt);

  const savedReply = await TripGPT.create({
    tripId,
    userId,
    gptReply,
    parsed: {}, // add parser later
  });

  return {
    gptReply,
    replyId: savedReply._id,
  };
}

module.exports = { handleTripGPTReply };
