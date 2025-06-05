const openai = require("../../config/openai");
const TripAsk = require("../../models/TripWell/TripAsk");
const TripGPT = require("../../models/TripWell/TripGPT");

function getDateString(date = new Date()) {
  return date.toISOString().split("T")[0];
}

async function handleTripChat({ tripId, userId, userInput, tripData, userData }) {
  const dateString = getDateString();
  const timestamp = new Date();

  // Save raw ask for tracking
  await TripAsk.create({
    tripId,
    userId,
    userInput,
    timestamp,
    dateString,
  });

  // If OpenAI not available, return fallback
  if (!openai) {
    console.warn("⚠️ OpenAI not configured. Skipping GPT reply.");
    const fallback = "AI is temporarily offline. Please try again later.";
    await TripGPT.create({
      tripId,
      userId,
      userInput,
      gptReply: fallback,
      parserOutput: null,
      timestamp,
      dateString,
    });
    return { reply: fallback };
  }

  // Compose GPT context
  const context = `
The user is planning a trip to ${tripData.destination} from ${tripData.dates?.join(" to ") || "unknown dates"}.
Their travel style includes: ${userData.travelStyle?.join(", ") || "not specified"}.

They said:
"""
${userInput}
"""

First, reply like a helpful local assistant — make it friendly, vibe-aware, and grounded in their trip context.

Then, attempt to parse the input into:
{
  travel: {},
  lodging: {},
  vibe: {},
  food: [],
  activities: []
}

Respond in this exact format:
===
[REPLY]
<text shown to user>

[PARSER]
<JSON block>
===
`;

  // Send to OpenAI
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: context }],
    temperature: 0.6,
  });

  const fullOutput = completion.choices[0].message.content.trim();
  const reply = fullOutput.split("===\n[PARSER]")[0].replace("===\n[REPLY]\n", "").trim();
  const parserBlock = fullOutput.split("===\n[PARSER]\n")[1]?.trim();

  let parserOutput = null;
  try {
    if (parserBlock) {
      parserOutput = JSON.parse(parserBlock);
    }
  } catch (err) {
    console.warn("⚠️ GPT parser output was not valid JSON");
  }

  // Save GPT reply
  await TripGPT.create({
    tripId,
    userId,
    userInput,
    gptReply: reply,
    parserOutput,
    timestamp,
    dateString,
  });

  return { reply };
}

module.exports = { handleTripChat };
