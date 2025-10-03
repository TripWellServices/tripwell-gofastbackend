
const OpenAI = require('openai');
const CourseProfile = require('../../models/CourseProfile');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateCourseVisualization(raceName) {
  const canonicalKey = raceName.trim().toLowerCase();

  const existing = await CourseProfile.findOne({ canonicalKey });
  if (existing) return existing;

  const prompt = `
You are a professional race coach. For the "${raceName}", generate the following JSON structure:
{
  "profile": "Short terrain summary",
  "highlights": ["One-liner for miles 1–5", "Mid race advice", "Late race strategy"],
  "coachNote": "Brief closing encouragement or strategic reminder"
}
`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7
  });

  const data = JSON.parse(completion.choices[0].message.content);

  const saved = await CourseProfile.create({
    raceName,
    canonicalKey,
    ...data,
    source: 'chatgpt',
  });

  return saved;
}