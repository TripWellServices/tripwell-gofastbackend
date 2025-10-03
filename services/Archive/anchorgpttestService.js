const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🤖 Test GPT anchor suggestion service with hardcoded prompt
async function generateAnchorSuggestionsTest() {
  const hardcodedPrompt = `
You are Angela, TripWell's smart travel planner.

Suggest 5 immersive travel *anchor experiences* for a **budget-friendly trip to Paris with my daughter**.

Anchor experiences are major parts of a trip — like a full-day excursion, iconic site visit, or themed cultural activity — that shape the rest of the day.

Return ONLY an array of 5 JSON objects.  
Each object must contain:
- title (string)
- description (string)
- location (string)
- isDayTrip (boolean)
- suggestedFollowOn (string)
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are Angela, TripWell's assistant." },
        { role: "user", content: hardcodedPrompt }
      ],
      temperature: 0.8,
      max_tokens: 600
    });

    const content = response.choices?.[0]?.message?.content || "[]";
    const parsedArray = JSON.parse(content);

    return { anchors: parsedArray };
  } catch (err) {
    console.error("Anchor GPT Test failed:", err);
    throw new Error("Failed to generate anchor suggestions");
  }
}

module.exports = { generateAnchorSuggestionsTest };
