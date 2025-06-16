// services/TripWell/GPTSceneSetterService.js

const { openai } = require("../../utils/openaiConfig");

async function GPTSceneSetterService({ city, tripLength, whoWith }) {
  const prompt = `
You are a warm, concise, and inspiring trip assistant.
The user is traveling to ${city}.
They are ${whoWith ? `traveling with ${whoWith}` : "traveling solo"}.
They have about ${tripLength} days for their trip.

Write 2–3 upbeat sentences to welcome them and set the scene.
Focus on the vibe of the destination and what makes this trip special.
Do NOT include any specific itinerary suggestions yet.
Just set the tone and build anticipation.
`;

  const res = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.85,
  });

  return res.choices[0].message.content.trim();
}

module.exports = GPTSceneSetterService;
