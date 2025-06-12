const express = require("express");
const router = express.Router({ mergeParams: true });

const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");
const TripAsk = require("../../models/TripWell/TripAsk");
const TripGPTRaw = require("../../models/TripWell/TripGPTRaw");
const Trip = require("../../models/TripWell/TripBase");
const OpenAI = require("openai");
const mongoose = require("mongoose");
const { deconstructGPTResponse } = require("../../services/TripWell/GPTResponseDeconstructor");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🧠 Build full trip-aware prompt
function buildPrompt({ userInput, userId, tripData }) {
  const destination = tripData?.destination || "an unspecified location";
  const dates = tripData?.startDate && tripData?.endDate
    ? `from ${new Date(tripData.startDate).toDateString()} to ${new Date(tripData.endDate).toDateString()}`
    : "";

  return `
You are TripWell AI, a smart assistant helping plan amazing trips.

User ${userId} is asking about a trip to ${destination} ${dates}.
Here’s what they said:
"""
${userInput}
"""

Reply with creative, location-aware suggestions tailored to that trip.
`.trim();
}

router.post("/:tripId/gpt", verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { tripId } = req.params;
    const tripObjectId = new mongoose.Types.ObjectId(tripId);

    console.log("🧠 TripGPT route hit:", { tripId, userId });

    const latestAsk = await TripAsk.findOne({ tripId: tripObjectId, userId }).sort({ timestamp: -1 });
    if (!latestAsk || !latestAsk.userInput) {
      return res.status(400).json({ error: "No saved ask found" });
    }

    // 🧠 Hydrate trip details for destination context
    const trip = await Trip.findById(tripObjectId);

    const prompt = buildPrompt({
      userInput: latestAsk.userInput,
      userId,
      tripData: trip,
    });

    // 🤖 Call GPT
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are TripWell AI." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    // 🧼 Deconstruct response into clean object
    const freeze = deconstructGPTResponse(response);

    // 💾 Save freeze-frame to TripGPTRaw
    const saved = await TripGPTRaw.create({
      tripId: tripObjectId,
      userId,
      request: { prompt },
      response: freeze,
      timestamp: new Date(),
    });

    const gptReply = freeze.choices?.[0]?.message?.content?.trim();

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
