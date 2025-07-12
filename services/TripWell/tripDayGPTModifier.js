const { OpenAI } = require("openai");
const openai = new OpenAI();

async function tripDayGPTModifier({ feedback, dayIndex, previousBlocks, summary }) {
  const systemPrompt = `
You are Angela, TripWell’s smart itinerary planner.

You’re improving a specific day of a trip itinerary based on user feedback. Use the feedback below to revise the existing blocks and summary. Keep smart pacing, stay within the daypart structure (morning, afternoon, evening), and preserve trip realism.

Return in this format:
{
  summary: "...",
  blocks: {
    morning: { title: "...", desc: "..." },
    afternoon: { title: "...", desc: "..." },
    evening: { title: "...", desc: "..." }
  }
}
  `.trim();

  const userPrompt = `
Day index: ${dayIndex}
Original summary: ${summary}

Original blocks:
${JSON.stringify(previousBlocks, null, 2)}

User feedback:
"${feedback}"
  `.trim();

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    temperature: 0.8,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]
  });

  const content = response.choices?.[0]?.message?.content;
  const parsed = JSON.parse(content || "{}");

  return parsed;
}

module.exports = tripDayGPTModifier;
