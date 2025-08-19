const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🧠 GPT prompt builder
function buildAnchorPrompt({ vibes, priorities, mobility, travelPace, budget, city, season, purpose, whoWith }) {
  return `
You are Angela, TripWell's smart travel planner.

Suggest 5 immersive travel *anchor experiences* based on the traveler's input. Anchor experiences are major parts of a trip — like a full-day excursion, iconic site visit, or themed cultural activity — that shape the rest of the day.

Traveler is going to **${city}** during **${season}**.  
Purpose of trip: ${purpose || "not specified"}  
Travel companions: ${Array.isArray(whoWith) ? whoWith.join(", ") : whoWith || "unspecified"}

Traveler Priorities:
The traveler emphasized these top trip priorities: **${priorities?.join(", ") || "no specific priorities"}**.  
Please scope your anchor suggestions around these interests.

Trip Vibe:
The intended vibe is **${vibes?.join(", ") || "flexible"}** — reflect this in the tone and energy of the experiences you suggest (e.g., romantic vs. playful, high-energy vs. relaxed).

Mobility & Travel Pace:
The traveler prefers to get around via **${mobility?.join(", ") || "any mode"}**.  
Please suggest anchors and follow-ons that are realistically accessible based on that. Avoid experiences that would require conflicting transportation methods.  
Preferred travel pace: **${travelPace?.join(", ") || "any"}**.

Budget Guidance:
The expected daily budget is **${budget || "flexible"}**.  
Structure your anchor experiences and follow-on suggestions to reflect that — i.e., a lower budget may favor local food tours or free cultural sites, while a higher budget may justify guided excursions or upscale experiences.

IMPORTANT: Respond with a JSON object containing an "anchors" array of exactly 5 objects. Each anchor object must contain:
- title (string)
- description (string)  
- location (string)
- isDayTrip (boolean)
- suggestedFollowOn (string)

Required JSON format:
{
  "anchors": [
    {
      "title": "Example Title",
      "description": "Example description",
      "location": "Example location", 
      "isDayTrip": false,
      "suggestedFollowOn": "Example follow-on activity"
    }
  ]
}

Return ONLY valid JSON. No markdown, no explanations, no extra text.
`.trim();
}

// 🤖 Main GPT anchor suggestion service
async function generateAnchorSuggestions({ tripId, userId, tripData, tripIntentData }) {
  if (!tripId || !userId) throw new Error("Missing tripId or userId");

  console.log("🔍 Using localStorage data:", { tripId, userId });
  console.log("🔍 tripData received:", tripData);
  console.log("🔍 tripIntentData received:", tripIntentData);

  // Use the data from localStorage that frontend sends
  const prompt = buildAnchorPrompt({
    city: tripData?.city || "Paris",
    season: tripData?.season || "Summer", 
    purpose: tripData?.purpose || "Make memories",
    whoWith: tripData?.whoWith || ["family"],
    priorities: tripIntentData?.priorities || ["culture", "food"],
    vibes: tripIntentData?.vibes || ["family-friendly", "educational"],
    mobility: tripIntentData?.mobility || ["walking", "metro"],
    travelPace: tripIntentData?.travelPace || ["moderate"],
    budget: tripIntentData?.budget || "mid-range"
  });

  try {
    console.log("🧪 Calling OpenAI with real data...");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are Angela, TripWell's assistant. You MUST respond with valid JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,  // Lower temperature for more consistent JSON
      max_tokens: 800,   // More tokens for complete responses
      response_format: { type: "json_object" }  // Force JSON response
    });

    const rawContent = response.choices?.[0]?.message?.content || "[]";
    console.log("🔍 Raw GPT response:", rawContent);
    
    let parsed;
    try {
      // Clean up the response - remove markdown formatting and extra text
      let cleanContent = rawContent.trim();
      
      // Remove markdown code blocks if present
      cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      console.log("🧹 Cleaned content:", cleanContent);
      const jsonResponse = JSON.parse(cleanContent);
      
      // Extract anchors array from the JSON object
      if (jsonResponse && jsonResponse.anchors && Array.isArray(jsonResponse.anchors)) {
        parsed = jsonResponse.anchors;
      } else if (Array.isArray(jsonResponse)) {
        // Fallback: if it's still an array format
        parsed = jsonResponse;
      } else {
        throw new Error("Invalid response format: missing anchors array");
      }
      
      // Validate the parsed data
      if (!Array.isArray(parsed)) {
        throw new Error("Anchors is not an array");
      }
      
    } catch (parseError) {
      console.error("❌ JSON parsing failed:", parseError);
      console.error("❌ Raw content that failed:", rawContent);
      
      // Return fallback anchors
      parsed = [
        {
          title: "City Center Exploration",
          description: "Explore the main attractions in the city center",
          location: "City Center",
          isDayTrip: false,
          suggestedFollowOn: "Local dining experience"
        },
        {
          title: "Cultural District Tour",
          description: "Visit museums and cultural sites",
          location: "Cultural District", 
          isDayTrip: false,
          suggestedFollowOn: "Traditional market visit"
        },
        {
          title: "Historic Landmarks Walk",
          description: "Walking tour of historic landmarks",
          location: "Historic District",
          isDayTrip: false,
          suggestedFollowOn: "Local cafe experience"
        }
      ];
      console.log("🔄 Using fallback anchors due to parsing error");
    }
    
    console.log("✅ OpenAI call successful! Got anchors:", parsed.length);

    return {
      anchors: parsed,
      raw: response
    };
  } catch (err) {
    console.error("❌ OpenAI call failed:", err);
    throw new Error("Failed to generate anchor suggestions");
  }
}

module.exports = { generateAnchorSuggestions };
