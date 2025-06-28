const { openai } = require("../../utils/openai");

module.exports = async ({ feedback, dayIndex, previousBlocks, summary }) => {
  const prompt = `
You are a helpful travel assistant named Angela. The user previously had the following itinerary for Day ${dayIndex}:

Summary: ${summary || "None"}

Morning: ${previousBlocks?.morning?.title || "N/A"} - ${previousBlocks?.morning?.desc || ""}
Afternoon: ${previousBlocks?.afternoon?.title || "N/A"} - ${previousBlocks?.afternoon?.desc || ""}
Evening: ${previousBlocks?.evening?.title || "N/A"} - ${previousBlocks?.evening?.desc || ""}

The user gave this feedback to revise the day:
"${feedback}"

Please generate a new itinerary for this day. Reply in JSON:
{
  "summary": "string",
  "blocks": {
    "morning": { "title": "string", "desc": "string" },
    "afternoon": { "title": "string", "desc": "string" },
    "evening": { "title": "string", "desc": "string" }
  }
}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    temperature: 0.8,
    messages: [{ role: "user", content: prompt }]
  });

  try {
    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    return parsed;
  } catch (err) {
    console.error("GPT parsing failed:", err);
    throw new Error("GPT response invalid");
  }
};