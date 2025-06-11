const { OpenAI } = require("openai"); // ✅ Grab the actual class
const TripGPTRaw = require("../../models/TripWell/TripGPTRaw");
const TripAsk = require("../../models/TripWell/TripAsk");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🧠 Build the prompt from user ask
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

async function handReply({ tripId, userId }) {
  if (!tripId || !userId) throw new Error("Missing tripId or userId");

  // 🔍 Find the most recent ask
  const latestAsk = await TripAsk.findOne({ tripId, userId }).sort({ timestamp: -1 });
  if (!latestAsk || !latestAsk.userInput) throw new Error("No userInput found in TripAsk");

  const userInput = latestAsk.userInput;
  const prompt = buildPrompt({ userInput, tripId, userId });

  // 🤖 Call GPT
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are TripWell AI." },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 300,
  });

  // 💾 Save full freeze frame to TripGPTRaw
  const saved = await TripGPTRaw.create({
    tripId,
    userId,
    raw: response, // full uncut object
    timestamp: new Date(),
  });

  const gptReply = response.choices?.[0]?.message?.content?.trim();

  return {
    gptReply,
    replyId: saved._id,
  };
}

module.exports = { handReply };
