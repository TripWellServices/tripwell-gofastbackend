// services/TripWell/GPTSceneSetterService.js

const OpenAI = require("openai");
const { deconstructGPTResponse, extractContentOnly } = require("./deconstructGPTResponse");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function buildScenePrompt(trip) {
  return `
You are TripWell AI, setting the tone for a traveler's upcoming trip.

The traveler is going to ${trip.city || "an unknown destination"} from ${trip.startDate?.toDateString()} to ${trip.endDate?.toDateString()}.
The purpose of the trip is: ${trip.purpose || "not specified"}.
They described the trip as: "${trip.tripName || "No name given"}".

Set the scene in 2–4 sentences. Make it personal, evocative, and helpful to visualize the vibe of the destination.

Do NOT include generic weather or safety advice. Focus on vibe, energy, and imagery.
  `.trim();
}

async function generateSceneSetter(trip) {
  const prompt = buildScenePrompt(trip);

  const rawResponse = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are TripWell AI. Set a vivid and useful travel vibe. No boilerplate." },
      { role: "user", content: prompt }
    ],
    temperature: 0.75,
    max_tokens: 250,
  });

  const parsed = deconstructGPTResponse(rawResponse);
  const sceneSetter = extractContentOnly(parsed);

  return sceneSetter;
}

module.exports = { generateSceneSetter };