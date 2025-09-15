const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * MetaAttractions Service - Creates the "obvious" attractions list
 * Then tells GPT to avoid all of them and build unique recommendations
 */

function buildMetaAttractionsPrompt({ city, season }) {
  return `
You are Angela, TripWell's smart travel planner. Generate the "obvious" tourist attractions for ${city} in ${season}.

These are the generic, touristy, "everyone goes here" attractions that we want to AVOID in our personalized recommendations.

Return a JSON array of 8-12 obvious attractions with this structure:
[
  {
    "name": "Eiffel Tower",
    "type": "landmark",
    "reason": "Most iconic symbol of the city"
  },
  {
    "name": "Louvre Museum", 
    "type": "museum",
    "reason": "World's largest art museum"
  }
]

Focus on the most obvious, touristy, generic attractions that every travel guide mentions.

Return only the JSON array. No explanations, markdown, or extra commentary.
`;
}

async function generateMetaAttractions({ city, season }) {
  const prompt = buildMetaAttractionsPrompt({ city, season });
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { 
        role: "system", 
        content: "You are Angela, TripWell's travel assistant. Return structured JSON only. No prose. No markdown." 
      },
      { role: "user", content: prompt }
    ],
    temperature: 0.3
  });

  return { rawResponse: completion.choices[0].message.content };
}

module.exports = { generateMetaAttractions };
