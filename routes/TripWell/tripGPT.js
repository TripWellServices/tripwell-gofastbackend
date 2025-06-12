const express = require("express");
const router = express.Router({ mergeParams: true });

const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");
const TripAsk = require("../../models/TripWell/TripAsk");
const TripGPTRaw = require("../../models/TripWell/TripGPTRaw");
const OpenAI = require("openai");
const mongoose = require("mongoose");
const { deconstructGPTResponse } = require("../../services/TripWell/GPTResponseDeconstructor");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/:tripId/gpt", verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { tripId } = req.params;
    const tripObjectId = new mongoose.Types.ObjectId(tripId);

    console.log("🧠 TripGPT route hit:", { tripId, userId });

    // 🔍 Get the latest ask
    const latestAsk = await TripAsk.findOne({ tripId: tripObjectId, userId }).sort({ timestamp: -1 });
    if (!latestAsk || !latestAsk.userInput) {
      return res.status(400).json({ error: "No saved ask found" });
    }

    const prompt = `
You are TripWell AI, a smart assistant helping plan amazing trips.
User ${userId} is asking about Trip ${tripId}.

Here’s what they said:
"""
${latestAsk.userInput}
"""
`.trim();

    // 🤖 Call OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4", // or "gpt-3.5-turbo"
      messages: [
        { role: "system", content: "You are TripWell AI." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    // 🧼 Deconstruct GPT class response
    const freeze = deconstructGPTResponse(response);

    // 💾 Save freeze frame to TripGPTRaw
    const saved = await TripGPTRaw.create({
      tripId: tripObjectId,
      userId,
      request: { prompt },
      response: freeze,
      timestamp: new Date(),
    });

    const gptReply = freeze.choices?.[0]?.message?.content?.trim();

    // 🧠 Respond with clean reply + rawId
    res.json({
      gptReply,
      rawId: saved._id,
    });
  } catch (err) {
    console.error("❌ GPT reply failed:", err);
    res.status(500).json({ error: "GPT error", details: err.message });
  }
});

module.exports = router;
