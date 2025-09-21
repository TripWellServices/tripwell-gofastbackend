const { OpenAI } = require("openai");

const openai = new OpenAI();

/**
 * Generate persona-based samples for user learning
 * Returns 2 attractions, 2 restaurants, 2 neat things tagged by persona
 */
async function generatePersonaSamples(city, personas, budget, whoWith, season, purpose) {
  try {
    console.log("🎯 Generating persona samples for:", { city, personas, budget, whoWith, season, purpose });

    // Convert numeric budget to category for GPT
    let budgetCategory = "moderate";
    if (budget < 200) budgetCategory = "budget";
    else if (budget > 400) budgetCategory = "luxury";

    const systemPrompt = `You are Angela, TripWell's smart travel planner. Generate 6 curated samples for ${city} based on the user's persona weights and preferences.

User Profile:
- Primary Persona Weights: ${JSON.stringify(personas)}
- Budget: ${budgetCategory} ($${budget}/day - consider budget level in recommendations)
- Traveling With: ${whoWith}
- Season: ${season}
- Trip Purpose: ${purpose}

Generate exactly 6 items with this structure:
1. 2 Attractions (tagged by persona)
2. 2 Restaurants (tagged by persona) 
3. 2 Neat Things (not meta attractions, tagged by persona)

Return a JSON object with this exact structure:
{
  "attractions": [
    {
      "id": "attr_1",
      "name": "Attraction Name",
      "type": "museum/landmark/etc",
      "description": "Brief description",
      "personaTags": ["art", "history"],
      "budgetLevel": "moderate"
    }
  ],
  "restaurants": [
    {
      "id": "rest_1", 
      "name": "Restaurant Name",
      "cuisine": "Italian/French/etc",
      "description": "Brief description",
      "personaTags": ["foodie", "art"],
      "budgetLevel": "luxury"
    }
  ],
  "neatThings": [
    {
      "id": "neat_1",
      "name": "Neat Thing Name", 
      "type": "experience/activity/etc",
      "description": "Brief description",
      "personaTags": ["adventure", "foodie"],
      "budgetLevel": "budget"
    }
  ]
}

Rules:
- Tag each item with relevant personas (art, foodie, adventure, history)
- Tag each item with budget level (budget, moderate, luxury)
- Avoid obvious tourist attractions (those are handled separately)
- Consider budget level, who they're traveling with, season, and trip purpose
- Make descriptions engaging but brief
- Ensure variety across the 6 samples
- Consider seasonal appropriateness (${season})

Return only the JSON object. No explanations, markdown, or extra commentary.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "You are Angela, TripWell's travel assistant. Return structured JSON only. No prose. No markdown." 
        },
        { role: "user", content: systemPrompt }
      ],
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content || "{}";
    console.log("✅ GPT persona samples generated");
    
    let samplesData;
    try {
      samplesData = JSON.parse(content);
    } catch (error) {
      const jsonString = content.replace(/'/g, '"');
      samplesData = JSON.parse(jsonString);
    }
    
    console.log("✅ Persona samples parsed:", {
      attractions: samplesData.attractions?.length || 0,
      restaurants: samplesData.restaurants?.length || 0,
      neatThings: samplesData.neatThings?.length || 0
    });
    
    return samplesData;
    
  } catch (error) {
    console.error("❌ Persona samples generation failed:", error);
    throw error;
  }
}

/**
 * Update persona weights based on user sample selections
 * Uses OpenAI to analyze selections and suggest new weights
 */
async function updatePersonaWeights(currentPersonas, selectedSamples, allSamples) {
  try {
    console.log("🎯 Updating persona weights based on selections:", selectedSamples);

    // Find the selected samples and their persona tags
    const selectedSampleData = [];
    const allSamplesFlat = [
      ...(allSamples.attractions || []),
      ...(allSamples.restaurants || []),
      ...(allSamples.neatThings || [])
    ];

    selectedSamples.forEach(sampleId => {
      const sample = allSamplesFlat.find(s => s.id === sampleId);
      if (sample) {
        selectedSampleData.push({
          name: sample.name,
          type: sample.type || sample.cuisine,
          personaTags: sample.personaTags || []
        });
      }
    });

    const systemPrompt = `You are Angela, TripWell's smart travel planner. Analyze the user's sample selections and suggest updated persona weights.

Current Persona Weights: ${JSON.stringify(currentPersonas)}

User Selected Samples:
${JSON.stringify(selectedSampleData, null, 2)}

Based on their selections, suggest new persona weights that better reflect their preferences.

Rules:
- Weights should add up to 1.0
- Primary persona should be 0.6, others 0.1 (unless selections suggest otherwise)
- If they selected items tagged with specific personas, increase those weights
- If they avoided certain personas, decrease those weights
- Be subtle in adjustments (0.05-0.1 changes max)

Return a JSON object with updated weights:
{
  "art": 0.6,
  "foodie": 0.1, 
  "adventure": 0.1,
  "history": 0.2
}

Return only the JSON object. No explanations, markdown, or extra commentary.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "You are Angela, TripWell's travel assistant. Return structured JSON only. No prose. No markdown." 
        },
        { role: "user", content: systemPrompt }
      ],
      temperature: 0.3,
    });

    const content = completion.choices[0].message.content || "{}";
    console.log("✅ GPT persona weight update generated");
    
    let updatedWeights;
    try {
      updatedWeights = JSON.parse(content);
    } catch (error) {
      const jsonString = content.replace(/'/g, '"');
      updatedWeights = JSON.parse(jsonString);
    }
    
    // Validate weights add up to 1.0
    const totalWeight = Object.values(updatedWeights).reduce((sum, weight) => sum + weight, 0);
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      console.log("⚠️ Weights don't add up to 1.0, normalizing...");
      Object.keys(updatedWeights).forEach(key => {
        updatedWeights[key] = updatedWeights[key] / totalWeight;
      });
    }
    
    console.log("✅ Updated persona weights:", updatedWeights);
    return updatedWeights;
    
  } catch (error) {
    console.error("❌ Persona weight update failed:", error);
    throw error;
  }
}

module.exports = {
  generatePersonaSamples,
  updatePersonaWeights
};
