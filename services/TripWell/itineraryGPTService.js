const { getLLMReadyData } = require("../llmHydrateService");
const { OpenAI } = require("openai");

const openai = new OpenAI();

/*
  Angela Itinerary Service
  
  ✅ Clean, simple flow
  ✅ Uses LLM-ready data (ONE source of truth)
  ✅ No deprecated helper functions
  ✅ Clean prompt structure
*/

async function generateItineraryFromMetaLogic(tripId, userId, selectedMetas = [], selectedSamples = []) {
  try {
    console.log("🎯 Hey Angela, build me an itinerary!");
    
    // 🎯 Step 1: Get LLM-ready data (ONE source of truth)
    const llmData = await getLLMReadyData(tripId);
    
    const { 
      season, whoWith, purpose, city, country, 
      tripPersonaLLM, tripBudgetLLM, tripSpacingLLM,
      daysTotal, startDate
    } = llmData;
    
    console.log("📋 Trip context:", { city, country, season, daysTotal, purpose });
    console.log("👤 User persona:", tripPersonaLLM);
    console.log("💰 Budget style:", tripBudgetLLM);
    console.log("🚶 Spacing style:", tripSpacingLLM);

    // 🎯 Step 2: Build calendar
    const start = new Date(startDate);
    const dayMap = Array.from({ length: daysTotal }).map((_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return {
        dayIndex: i + 1,
        isoDate: date.toISOString().split("T")[0],
        weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
        formatted: date.toLocaleDateString("en-US", { month: "long", day: "numeric" }),
        label: `Day ${i + 1} – ${date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`
      };
    });

    // 🎯 Step 3: Build clean prompt
    const systemPrompt = `You are Angela, a highly intuitive AI travel planner.

**TRIP OVERVIEW:**
${daysTotal}-day trip to ${city}, ${country} during ${season}
Purpose: ${purpose}
Traveling with: ${whoWith}

**USER PROFILE:**
${tripPersonaLLM}

**BUDGET & STYLE:**
${tripBudgetLLM}
${tripSpacingLLM}

**MUST INCLUDE:**
${selectedMetas.length > 0 ? selectedMetas.map(meta => `• ${meta.name}: ${meta.description}`).join('\n') : '• No specific meta attractions selected'}

**USER PREFERENCES (from sample selections):**
${selectedSamples.length > 0 ? selectedSamples.map(sample => `• ${sample.name} (${sample.type}): ${sample.why_recommended}`).join('\n') : '• No sample preferences selected'}

**INSTRUCTIONS:**
Create a ${daysTotal}-day itinerary following this structure:
• **Meta Attractions**: Include 1 meta attraction per day (spread across days)
• **Day Structure**: Once meta attraction is placed, fill with restaurants and neat things to do
• **Spacing**: Respect their spacing preferences (relaxed/balanced/packed)
• **Persona Matching**: Use their persona profile (described above) to select similar activities
• **Budget Matching**: Use their budget level (described above) for activity selection

**Day Structure Rules:**
- **1 meta attraction per day** (can be morning, afternoon, or evening)
- **Fill remaining blocks** with restaurants and neat things to do
- **Mix up the order** - be creative with timing
- **Balance**: Mix of attractions, restaurants, and neat things to do

**FORMAT:**
Return a JSON object with this exact structure:

{
  "days": [
    {
      "dayIndex": 1,
      "summary": "Brief day overview",
      "blocks": {
        "morning": {
          "activity": "Activity name",
          "type": "attraction|restaurant|activity|transport|free_time",
          "persona": "art|foodie|history|adventure",
          "budget": "budget|moderate|luxury"
        },
        "afternoon": {
          "activity": "Activity name",
          "type": "attraction|restaurant|activity|transport|free_time",
          "persona": "art|foodie|history|adventure",
          "budget": "budget|moderate|luxury"
        },
        "evening": {
          "activity": "Activity name",
          "type": "attraction|restaurant|activity|transport|free_time",
          "persona": "art|foodie|history|adventure",
          "budget": "budget|moderate|luxury"
        }
      }
    }
  ]
}

Include only Day 1 through Day ${daysTotal}. Return ONLY the JSON object.`;

    const userPrompt = `Here is the trip calendar:
${JSON.stringify(dayMap, null, 2)}

Here are the selected meta attractions to integrate:
${JSON.stringify(selectedMetas, null, 2)}

Here are the selected samples that influenced the persona weights:
${JSON.stringify(selectedSamples, null, 2)}`;

    // 🎯 Step 4: Call Angela
    console.log("🤖 Calling Angela with clean data...");
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      temperature: 0.8,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });

    const content = completion.choices?.[0]?.message?.content;
    if (!content) throw new Error("No GPT output received.");

    // Parse JSON response
    let itineraryData;
    try {
      itineraryData = JSON.parse(content);
    } catch (error) {
      console.error("❌ Failed to parse Angela's JSON response:", error);
      throw new Error("Invalid JSON response from Angela");
    }

    console.log("✅ Angela built the itinerary with tags!");
    return {
      rawText: content,
      structuredData: itineraryData
    };
    
  } catch (error) {
    console.error("❌ Angela itinerary generation error:", error);
    throw error;
  }
}

module.exports = { generateItineraryFromMetaLogic };