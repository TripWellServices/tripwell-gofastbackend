const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Enhanced PlaceTodo Service - Uses MetaPlace data to generate better content
 * This service takes the foundational MetaPlace data and creates detailed,
 * personalized content for each section
 */

function buildEnhancedPlaceTodoPrompt({ metaPlaceData, inputVariables, section }) {
  const { city, season, purpose, whoWith, priorities, vibes, mobility, travelPace, budget } = inputVariables;
  
  // Extract key insights from MetaPlace
  const placeIdentity = metaPlaceData.placeIdentity;
  const travelerPersona = metaPlaceData.travelerPersona;
  const budgetAnalysis = metaPlaceData.budgetAnalysis;
  const priorityMapping = metaPlaceData.priorityMapping;
  const vibeTranslation = metaPlaceData.vibeTranslation;
  const contentThemes = metaPlaceData.contentThemes;
  
  const sectionPrompts = {
    attractions: `
You are Angela, TripWell's smart travel planner. Generate 8-12 personalized attractions for this specific traveler profile.

**PLACE IDENTITY:** ${placeIdentity.name} - ${placeIdentity.tagline}
**TRAVELER:** ${travelerPersona.type} (${travelerPersona.ageRange})
**BUDGET:** ${budgetAnalysis.dailyBudget} daily (Activities: ${budgetAnalysis.activities})
**PRIORITIES:** ${Object.entries(priorityMapping).map(([k,v]) => `${k}: ${v.join(', ')}`).join(' | ')}
**VIBES:** ${Object.entries(vibeTranslation).map(([k,v]) => `${k}: ${v.join(', ')}`).join(' | ')}
**CONTENT THEMES:** ${contentThemes.join(' | ')}

Generate attractions that are:
- Budget-appropriate for ${budgetAnalysis.activities} daily
- Aligned with ${travelerPersona.interests.join(', ')} interests
- Perfect for ${whoWith} travel
- ${season}-specific and ${city}-authentic
- Match the ${placeIdentity.uniqueCharacteristics.join(', ')} characteristics

For each attraction, provide:
- Name (specific, not generic)
- Description (2-3 sentences, personalized to this traveler)
- Location (neighborhood/area)
- Cost (specific to budget: Free, $5-15, $15-30, $30+)
- Why it's perfect for this specific traveler
- Best time to visit (considering season and traveler preferences)

Return as JSON array with detailed, personalized recommendations.
`,

    restaurants: `
You are Angela, TripWell's smart travel planner. Generate 6-10 personalized restaurant recommendations.

**PLACE IDENTITY:** ${placeIdentity.name} - ${placeIdentity.tagline}
**TRAVELER:** ${travelerPersona.type} (${travelerPersona.ageRange})
**BUDGET:** ${budgetAnalysis.dailyBudget} daily (Food: ${budgetAnalysis.food})
**PRIORITIES:** ${Object.entries(priorityMapping).map(([k,v]) => `${k}: ${v.join(', ')}`).join(' | ')}
**VIBES:** ${Object.entries(vibeTranslation).map(([k,v]) => `${k}: ${v.join(', ')}`).join(' | ')}
**CONTENT THEMES:** ${contentThemes.join(' | ')}

Generate restaurants that are:
- Budget-appropriate for ${budgetAnalysis.food} daily food budget
- Perfect for ${whoWith} dining (consider group dynamics)
- Aligned with ${travelerPersona.interests.join(', ')} interests
- ${season}-specific (consider seasonal menus, outdoor seating)
- ${city}-authentic and local
- Match the ${placeIdentity.uniqueCharacteristics.join(', ')} characteristics

For each restaurant, provide:
- Name (specific restaurant, not generic)
- Description (2-3 sentences, personalized to this traveler)
- Location (neighborhood/area)
- Price Range (specific to budget: $, $$, $$$)
- Cuisine Type (specific, not generic)
- Why it's perfect for this specific traveler
- Best time to visit (considering season and traveler preferences)
- Special considerations (reservations, dress code, group size)

Return as JSON array with detailed, personalized recommendations.
`,

    mustSee: `
You are Angela, TripWell's smart travel planner. Generate 5-8 must-see experiences.

**PLACE IDENTITY:** ${placeIdentity.name} - ${placeIdentity.tagline}
**TRAVELER:** ${travelerPersona.type} (${travelerPersona.ageRange})
**BUDGET:** ${budgetAnalysis.dailyBudget} daily (Activities: ${budgetAnalysis.activities})
**PRIORITIES:** ${Object.entries(priorityMapping).map(([k,v]) => `${k}: ${v.join(', ')}`).join(' | ')}
**VIBES:** ${Object.entries(vibeTranslation).map(([k,v]) => `${k}: ${v.join(', ')}`).join(' | ')}
**CONTENT THEMES:** ${contentThemes.join(' | ')}

Generate must-see experiences that are:
- Essential for this specific traveler profile
- Budget-appropriate for ${budgetAnalysis.activities} daily
- Perfect for ${whoWith} travel
- ${season}-specific and ${city}-authentic
- Match the ${placeIdentity.uniqueCharacteristics.join(', ')} characteristics
- Aligned with ${travelerPersona.interests.join(', ')} interests

For each must-see, provide:
- Name (specific experience, not generic)
- Description (2-3 sentences, personalized to this traveler)
- Location (neighborhood/area)
- Cost (specific to budget: Free, $5-15, $15-30, $30+)
- Why it's essential for this specific traveler
- Best time to visit (considering season and traveler preferences)
- Duration (how long to spend there)
- Pro tips (specific to this traveler's needs)

Return as JSON array with detailed, personalized recommendations.
`,

    mustDo: `
You are Angela, TripWell's smart travel planner. Generate 4-6 must-do activities.

**PLACE IDENTITY:** ${placeIdentity.name} - ${placeIdentity.tagline}
**TRAVELER:** ${travelerPersona.type} (${travelerPersona.ageRange})
**BUDGET:** ${budgetAnalysis.dailyBudget} daily (Activities: ${budgetAnalysis.activities})
**PRIORITIES:** ${Object.entries(priorityMapping).map(([k,v]) => `${k}: ${v.join(', ')}`).join(' | ')}
**VIBES:** ${Object.entries(vibeTranslation).map(([k,v]) => `${k}: ${v.join(', ')}`).join(' | ')}
**CONTENT THEMES:** ${contentThemes.join(' | ')}

Generate must-do activities that are:
- Essential for this specific traveler profile
- Budget-appropriate for ${budgetAnalysis.activities} daily
- Perfect for ${whoWith} travel
- ${season}-specific and ${city}-authentic
- Match the ${placeIdentity.uniqueCharacteristics.join(', ')} characteristics
- Aligned with ${travelerPersona.interests.join(', ')} interests

For each must-do, provide:
- Name (specific activity, not generic)
- Description (2-3 sentences, personalized to this traveler)
- Location (neighborhood/area)
- Cost (specific to budget: Free, $5-15, $15-30, $30+)
- Why it's essential for this specific traveler
- Best time to do (considering season and traveler preferences)
- Duration (how long it takes)
- Pro tips (specific to this traveler's needs)

Return as JSON array with detailed, personalized recommendations.
`
  };

  return sectionPrompts[section] || sectionPrompts.attractions;
}

async function generateEnhancedPlaceTodo({ placeSlug, inputVariables, metaPlaceData, section }) {
  const prompt = buildEnhancedPlaceTodoPrompt({ metaPlaceData, inputVariables, section });
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { 
        role: "system", 
        content: "You are Angela, TripWell's travel assistant. Return structured JSON only. No prose. No markdown. Focus on creating highly personalized, budget-appropriate recommendations that match the specific traveler profile." 
      },
      { role: "user", content: prompt }
    ],
    temperature: 0.8
  });

  return { rawResponse: completion.choices[0].message.content };
}

module.exports = { generateEnhancedPlaceTodo };
