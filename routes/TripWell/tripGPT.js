// routes/TripWell/tripGPT.js

const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

const TripGPT = require("../../models/TripWell/TripGPT");
const TripAsk = require("../../models/TripWell/TripAsk");
const { deconstructGPTResponse } = require("../../services/TripWell/deconstructGPTResponse");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function buildPrompt({ userInput }) {
  return `
You are TripWell AI, a smart assistant helping people plan unforgettable travel experiences.

Here’s the traveler's question:
"""
${userInput}
"""

Respond with specific, thoughtful suggestions. Do **not** include system metadata like trip IDs or user IDs in your answer. Keep your tone friendly, knowledgeable, and focused on improving the traveler’s real-world experience.
`.trim();
}

async function handReply({ tripId, userId }) {
  if (!tripId || !userId) throw new Error("Missing tripId or userId");

  const latestAsk = await TripAsk.findOne({ tripId, userId }).sort({ timestamp: -1 });
  if (!latestAsk || !latestAsk.userInput) throw new Error("No userInput found in TripAsk");

  const prompt = buildPrompt({ userInput: latestAsk.userInput });

  const rawResponse = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are TripWell AI. You speak directly to travelers. Never mention system IDs like tripId or userId. Offer specific suggestions like restaurants, activities, or hidden gems.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 300,
  });

  const safeResponse = deconstructGPTResponse(rawResponse);
  const gptReply = safeResponse.choices[0].message.content.trim();

  const savedReply = await TripGPT.create({
    tripId,
    userId,
    gptReply,
    parsed: {},
    timestamp: new Date(),
  });

  return {
    gptReply,
    replyId: savedReply._id,
  };
}

// === POST /tripwell/:tripId/gpt ===
router.post("/:tripId/gpt", async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user?.uid;

  try {
    const result = await handReply({ tripId, userId });
    res.json(result);
  } catch (err) {
    console.error("❌ GPT reply failed:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
