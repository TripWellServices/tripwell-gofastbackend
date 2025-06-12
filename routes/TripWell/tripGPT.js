// routes/TripWell/tripGPT.js

const express = require("express");
const router = express.Router({ mergeParams: true });

const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");
const TripAsk = require("../../models/TripWell/TripAsk");
const TripGPTRaw = require("../../models/TripWell/TripGPTRaw");
const { openai } = require("../../config/openai");
const { deconstructGPTResponse } = require("../../services/TripWell/GPTResponseDeconstructor");
const TripGPT = require("../../models/TripWell/TripGPT");

router.post("/:tripId/gpt", verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { tripId } = req.params;

    console.log("🧠 TripGPT route hit:", { tripId, userId });

    const latestAsk = await TripAsk.findOne({ tripId, userId }).sort({ timestamp: -1 });
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

    const gptRawResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are TripWell AI." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    // 💾 Save clean raw freeze frame (now as plain JSON)
    const raw = await TripGPTRaw.create({
      tripId,
      userId,
      prompt,
      response: gptRawResponse.toJSON(),
      timestamp: new Date(),
    });

    // 🧠 Pull out the actual GPT reply string
    const { gptReply } = deconstructGPTResponse(gptRawResponse);

    // 💾 Optionally persist the GPT reply (you can remove this if front-end only)
    await TripGPT.create({
      tripId,
      userId,
      gptReply,
      timestamp: new Date(),
    });

    return res.json({ gptReply });
  } catch (err) {
    console.error("❌ GPT reply failed:", err);
    res.status(500).json({ error: "GPT error", details: err.message });
  }
});

module.exports = router;
