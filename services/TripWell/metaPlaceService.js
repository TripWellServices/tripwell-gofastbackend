const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * MetaPlace Service - Creates foundational place data
 * This generates the "meta" information that will be used to create
 * better, more personalized prompts for detailed content generation
 */

function buildMetaPlacePrompt({ inputVariables }) {
  const { city, season, purpose, whoWith, priorities, vibes, mobility, travelPace, budget } = inputVariables;
  
  return `
You are Angela, TripWell's smart travel planner. Create a foundational "MetaPlace" profile that will be used to generate detailed travel content.

**CITY:** ${city}
**SEASON:** ${season}
**PURPOSE:** ${purpose}
**WHO WITH:** ${whoWith}
**PRIORITIES:** ${priorities.join(', ')}
**VIBES:** ${vibes.join(', ')}
**MOBILITY:** ${mobility.join(', ')}
**TRAVEL PACE:** ${travelPace.join(', ')}
**BUDGET:** ${budget}

Generate a comprehensive MetaPlace profile that includes:

1. **Place Identity**: A unique, memorable name for this specific trip profile
2. **Traveler Persona**: Detailed description of the traveler(s) and their preferences
3. **Trip Context**: Season, purpose, and unique characteristics
4. **Budget Analysis**: What the budget means in practical terms for this destination
5. **Priority Mapping**: How each priority translates to specific activities/experiences
6. **Vibe Translation**: How the vibes manifest in this specific place and season
7. **Mobility Strategy**: How mobility preferences work in this city
8. **Pace Planning**: How travel pace affects the itinerary structure
9. **Local Insights**: Key cultural, seasonal, and practical considerations
10. **Content Themes**: 3-5 overarching themes that should guide all content generation

Return as structured JSON with clear, actionable data that can be used to generate personalized prompts for attractions, restaurants, must-see, and must-do content.

Example structure:
{
  "placeIdentity": {
    "name": "Paris Budget Backpacker",
    "tagline": "Affordable adventures for the solo explorer",
    "uniqueCharacteristics": ["budget-conscious", "solo-friendly", "authentic experiences"]
  },
  "travelerPersona": {
    "type": "Solo Budget Backpacker",
    "ageRange": "20s-30s",
    "interests": ["culture", "history", "local experiences"],
    "travelStyle": "independent", "flexible", "adventure-seeking"
  },
  "tripContext": {
    "season": "Spring",
    "purpose": "Cultural exploration",
    "duration": "3-5 days",
    "keyConsiderations": ["weather", "crowds", "events"]
  },
  "budgetAnalysis": {
    "dailyBudget": "$50-75",
    "accommodation": "$25-35/night",
    "food": "$20-30/day",
    "activities": "$15-25/day",
    "transportation": "$10-15/day"
  },
  "priorityMapping": {
    "Culture & History": ["museums", "historic sites", "cultural events"],
    "Food & Dining": ["local markets", "budget restaurants", "street food"]
  },
  "vibeTranslation": {
    "Adventurous & Active": ["walking tours", "outdoor activities", "exploration"],
    "Authentic & Local": ["neighborhoods", "local spots", "cultural immersion"]
  },
  "mobilityStrategy": {
    "primary": "Walking",
    "secondary": "Public transport",
    "considerations": ["walkable areas", "metro access", "safety"]
  },
  "pacePlanning": {
    "style": "Moderate",
    "dailyStructure": "2-3 major activities per day",
    "flexibility": "built-in free time"
  },
  "localInsights": {
    "seasonal": "Spring weather, fewer crowds",
    "cultural": "French dining culture, museum etiquette",
    "practical": "Metro system, walking distances"
  },
  "contentThemes": [
    "Budget-friendly cultural experiences",
    "Authentic local neighborhoods",
    "Solo traveler safety and social opportunities",
    "Spring-specific activities and events",
    "French culture and history immersion"
  ]
}
`;
}

async function generateMetaPlace({ placeSlug, inputVariables }) {
  const prompt = buildMetaPlacePrompt({ inputVariables });
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { 
        role: "system", 
        content: "You are Angela, TripWell's travel assistant. Return structured JSON only. No prose. No markdown. Focus on creating actionable, detailed meta data that will guide content generation." 
      },
      { role: "user", content: prompt }
    ],
    temperature: 0.7
  });

  return { rawResponse: completion.choices[0].message.content };
}

module.exports = { generateMetaPlace };
