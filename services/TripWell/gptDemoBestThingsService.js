// services/TripWell/gptDemoBestThingsService.js
const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate demo best things recommendations for a destination
 * @param {Object} params - Parameters for best things generation
 * @param {string} params.destination - Destination city/country
 * @param {string} params.category - Category filter (all, food, culture, nature, nightlife)
 * @param {string} params.budget - Budget level (low, medium, high)
 * @returns {Promise<Object>} Best things data
 */
async function generateDemoBestThings(params) {
  const { destination, category, budget } = params;

  const categoryDescriptions = {
    all: "all categories including food, culture, nature, and entertainment",
    food: "culinary experiences, restaurants, cafes, and food markets",
    culture: "museums, historical sites, art galleries, and cultural experiences",
    nature: "parks, outdoor activities, natural attractions, and scenic spots",
    nightlife: "bars, clubs, entertainment venues, and evening activities"
  };

  const budgetDescriptions = {
    low: "budget-friendly options that are affordable",
    medium: "mid-range options that offer good value",
    high: "premium and luxury experiences"
  };

  const prompt = `You are Angela, a knowledgeable travel expert. Generate 5-7 of the absolute best things to do in ${destination}, focusing on ${categoryDescriptions[category]} with ${budgetDescriptions[budget]} options.

For each recommendation, provide:
1. A catchy name
2. A brief description (1-2 sentences)
3. Why it's considered one of the best (1 sentence)
4. An appropriate emoji
5. A category tag

Format your response as a JSON object with this structure:
{
  "bestThings": [
    {
      "name": "Attraction Name",
      "description": "Brief description of what it is",
      "whyBest": "Why this is considered one of the best in the destination",
      "emoji": "🏛️",
      "category": "Culture"
    }
  ]
}

Make sure the recommendations are:
- Actually located in ${destination}
- Highly rated and well-known
- Suitable for the specified budget level
- Diverse and interesting
- Include both popular and hidden gem options

Return ONLY the JSON object, no additional text.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are Angela, a travel expert who provides accurate, helpful travel recommendations. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const response = completion.choices[0].message.content;
    
    // Parse the JSON response
    let bestThingsData;
    try {
      bestThingsData = JSON.parse(response);
    } catch (parseError) {
      console.error("Failed to parse GPT response:", parseError);
      throw new Error("Failed to generate recommendations");
    }

    // Validate the response structure
    if (!bestThingsData.bestThings || !Array.isArray(bestThingsData.bestThings)) {
      throw new Error("Invalid response structure from GPT");
    }

    return {
      destination,
      category,
      budget,
      bestThings: bestThingsData.bestThings,
      generatedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error("GPT demo best things generation error:", error);
    throw new Error("Failed to generate best things recommendations");
  }
}

module.exports = {
  generateDemoBestThings
};
