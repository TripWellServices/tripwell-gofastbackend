// routes/TripWell/tripGPT.js
const express = require("express");
const router = express.Router({ mergeParams: true });

const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");
const TripGPTRaw = require("../../models/TripWell/TripGPTRaw");
const { GPTRawMover } = require("../../services/TripWell/GPTRawMover");
const openai = require("../../config/openai"); // ✅ no destructuring
const TripAsk = require("../../models/TripWell/TripAsk");

router.post("/:tripId/gpt", verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { tripId } = req.params;

    if (!openai) throw new Error("OpenAI not initialized");

    console.log("🧠 TripGPT route hit:", { tripId, userId });

    // 1. Fetch latest ask
    const latestAsk = await TripAsk.findOne({ tripId, userId }).sort({ timestamp: -1 });
    if (!latestAsk || !latestAsk.userInput) {
      return res.status(400).json({ error: "No saved ask found" });
    }

    // 2. Build prompt
    const prompt = `
You are TripWell AI, a smart assistant helping plan amazing trips.
User ${userId} is asking about Trip ${tripId}.

Here’s what they said:
"""
${latestAsk.userInput}
"""
`.trim();

    // 3. Fire GPT and save full freeze frame
    const gptRawResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are TripWell AI." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const raw = await TripGPTRaw.create({
      tripId,
      userId,
      request: { prompt },
      response: gptRawResponse,
      timestamp: new Date(),
    });

    // 4. Move into TripGPT
    const { gptReply } = await GPTRawMover({ tripId, userId, rawId: raw._id });

    // 5. Send reply
    res.json({ gptReply });
  } catch (err) {
    console.error("❌ GPT reply failed:", err);
    res.status(500).json({ error: "GPT error", details: err.message });
  }
});

module.exports = router;
