const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const gptDemoBuildService = async (destination, season, numDays, tripGoals = []) => {
  try {
    const goalsText = tripGoals.length > 0 ? ` with focus on: ${tripGoals.join(', ')}` : '';
    
    const prompt = `You are Angela, a travel expert. Create a ${numDays}-day itinerary for ${destination} during ${season}${goalsText}.

Please provide a realistic, enjoyable itinerary with 3 activities per day (morning, afternoon, evening). 
Focus on the most popular and worthwhile attractions, restaurants, and experiences.

Format your response as a JSON object with this exact structure:
{
  "destination": "${destination}",
  "season": "${season}",
  "numDays": ${numDays},
  "tripGoals": ${JSON.stringify(tripGoals)},
  "days": [
    {
      "day": 1,
      "summary": "Brief summary of the day",
      "activities": [
        {
          "time": "morning",
          "title": "Activity title",
          "description": "Brief description of the activity"
        },
        {
          "time": "afternoon", 
          "title": "Activity title",
          "description": "Brief description of the activity"
        },
        {
          "time": "evening",
          "title": "Activity title", 
          "description": "Brief description of the activity"
        }
      ]
    }
  ]
}

Make the activities practical and enjoyable. Include a mix of sightseeing, food, and local experiences.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are Angela, a knowledgeable and enthusiastic travel expert. Provide helpful, accurate travel advice and create engaging itineraries."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const response = completion.choices[0].message.content;
    
    // Try to parse the JSON response
    try {
      const itineraryData = JSON.parse(response);
      return {
        success: true,
        itineraryDataDemo: itineraryData
      };
    } catch (parseError) {
      console.error("Failed to parse GPT response as JSON:", parseError);
      // Return a fallback structure
      return {
        success: true,
        itineraryDataDemo: {
          destination,
          season,
          numDays,
          tripGoals,
          days: Array.from({ length: numDays }, (_, i) => ({
            day: i + 1,
            summary: `Day ${i + 1} in ${destination}`,
            activities: [
              {
                time: "morning",
                title: `Morning activity in ${destination}`,
                description: `Start your day exploring ${destination}`
              },
              {
                time: "afternoon",
                title: `Afternoon activity in ${destination}`,
                description: `Continue your adventure in ${destination}`
              },
              {
                time: "evening",
                title: `Evening activity in ${destination}`,
                description: `End your day in ${destination}`
              }
            ]
          }))
        }
      };
    }

  } catch (error) {
    console.error("❌ Error in gptDemoBuildService:", error);
    throw new Error("Failed to generate demo itinerary");
  }
};

module.exports = { gptDemoBuildService };
