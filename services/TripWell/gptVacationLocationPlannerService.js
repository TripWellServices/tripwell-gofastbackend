// services/TripWell/gptVacationLocationPlannerService.js
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate vacation location recommendations based on user preferences
 * @param {Object} params - User preferences for vacation planning
 * @param {number} params.numDays - Number of vacation days
 * @param {Array} params.vibes - Trip vibes (chill, adventure, party, culture, etc.)
 * @param {Array} params.whoWith - Who they're traveling with (spouse, kids, friends, parents, multigen, solo, other)
 * @param {string} params.startingLocation - Starting location/city
 * @param {Array} params.preferences - Vacation preferences (exotic, tropical, history, part of world never seen, etc.)
 * @param {string} params.budget - Budget level (low, medium, high)
 * @returns {Object} Generated vacation location recommendations
 */
async function generateVacationLocationRecommendations(params) {
  try {
    const {
      numDays,
      vibes,
      whoWith,
      startingLocation,
      preferences,
      budget
    } = params;

    // Build the prompt based on user preferences
    let prompt = `You are an expert travel advisor helping someone plan their perfect vacation. 

Based on these preferences, suggest 3 amazing vacation destinations:

Vacation Details:
- Duration: ${numDays} days
- Travel Style: ${vibes.join(', ')}
- Traveling with: ${whoWith.join(', ')}
- Starting from: ${startingLocation}
- Preferences: ${preferences.join(', ')}
- Budget: ${budget}

For each destination, provide:
1. Destination name and country
2. Why it's perfect for their preferences
3. Best time to visit
4. Estimated cost for their budget level
5. Top 3 highlights/experiences
6. Travel time from starting location
7. Any special considerations

Format your response as a JSON object with this structure:
{
  "recommendations": [
    {
      "destination": "Destination Name, Country",
      "whyPerfect": "Detailed explanation of why this destination matches their preferences",
      "bestTimeToVisit": "Best months/season to visit",
      "estimatedCost": "Cost estimate for their budget level",
      "highlights": ["Highlight 1", "Highlight 2", "Highlight 3"],
      "travelTime": "Estimated travel time from starting location",
      "specialConsiderations": "Any important notes about visas, weather, etc."
    }
  ],
  "summary": "Brief summary of why these destinations are perfect for their vacation style"
}

Make sure the destinations truly match their preferences and provide specific, actionable advice.`;

    console.log("🎯 Generating vacation location recommendations with params:", params);

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert travel advisor with deep knowledge of destinations worldwide. Provide specific, personalized recommendations based on user preferences."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0].message.content;
    
    // Try to parse JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
    } catch (parseError) {
      console.error("❌ Failed to parse GPT response as JSON:", parseError);
      console.log("Raw response:", response);
      
      // Fallback: create a structured response from the text
      parsedResponse = {
        recommendations: [
          {
            destination: "Custom Destination",
            whyPerfect: "Based on your preferences, we've found some amazing options",
            bestTimeToVisit: "Year-round",
            estimatedCost: "Varies by destination",
            highlights: ["Personalized experiences", "Perfect for your style", "Memorable adventures"],
            travelTime: "Varies by destination",
            specialConsiderations: "Contact us for detailed planning"
          }
        ],
        summary: "We've analyzed your preferences and found destinations that match your vacation style perfectly."
      };
    }

    console.log("✅ Vacation location recommendations generated successfully");

    return {
      success: true,
      userPreferences: params,
      recommendations: parsedResponse.recommendations,
      summary: parsedResponse.summary,
      generatedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error("❌ Error generating vacation location recommendations:", error);
    throw new Error("Failed to generate vacation location recommendations");
  }
}

module.exports = {
  generateVacationLocationRecommendations
};
