const express = require("express");
const router = express.Router({ mergeParams: true });

const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");
const TripAsk = require("../../models/TripWell/TripAsk");
const TripGPTRaw = require("../../models/TripWell/TripGPTRaw");
const TripGPT = require("../../models/TripWell/TripGPT");

const openai = require("../../config/openai");
const { deconstructGPTResponse } = require("../../services/TripWell/GPTResponseDeconstructor");

router.post("/:tripId/gpt", verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { tripId } = req.params;

    console.log("🧠 TripGPT route hit:", { tripId, userId });

    // 1. Get the latest user ask
    const latestAsk = await TripAsk.findOne({ tripId, userId }).sort({ timestamp: -1 });
    if (!latestAsk || !latestAsk.userInput) {
      return res.status(400).json({ error: "No saved ask found." });
    }

    // 2. Build the GPT prompt
    const prompt = `
You are TripWell AI, a smart assistant helping plan amazing trips.
User ${userId} is asking about Trip ${tripId}.

Here’s what they said:
"""
${latestAsk.userInput}
"""
`.trim();

    // 3. Fire GPT
    const gptResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are TripWell AI." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    // 4. Save full response in TripGPTRaw
    const raw = await TripGPTRaw.create({
      tripId,
      userId,
      response: gptResponse,
      timestamp: new Date(),
    });

    // 5. Parse reply content
    const { gptReply } = deconstructGPTResponse(gptResponse);

    // 6. Save to TripGPT
    await TripGPT.create({
      tripId,
      userId,
      gptReply,
      parsed: {}, // placeholder
      timestamp: new Date(),
    });

    // 7. Return to frontend
    res.json({ gptReply });
  } catch (err) {
    console.error("❌ GPT reply failed:", err);
    res.status(500).json({ error: "GPT error", details: err.message });
  }
});

module.exports = router;
