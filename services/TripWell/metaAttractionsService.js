const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MetaAttractions = require("../../models/TripWell/MetaAttractions");

/**
 * MetaAttractions Service - Creates the "obvious" attractions list
 * Then tells GPT to avoid all of them and build unique recommendations
 */

function buildMetaAttractionsPrompt({ city, season }) {
  return `
You are Angela, TripWell's smart travel planner. Generate the "obvious" tourist attractions for ${city} in ${season}.

These are the generic, touristy, "everyone goes here" attractions that we want to AVOID in our personalized recommendations.

Return a JSON array of 8-12 obvious attractions with this structure:
[
  {
    "name": "Eiffel Tower",
    "type": "landmark",
    "reason": "Most iconic symbol of the city"
  },
  {
    "name": "Louvre Museum", 
    "type": "museum",
    "reason": "World's largest art museum"
  }
]

Focus on the most obvious, touristy, generic attractions that every travel guide mentions.

Return only the JSON array. No explanations, markdown, or extra commentary.
`;
}

async function generateMetaAttractions(cityId, cityName, season) {
  console.log("🔄 Generating meta attractions for:", cityName, season);
  console.log("🔄 CityId:", cityId);
  console.log("🔄 Season:", season);
  
  try {
    const prompt = buildMetaAttractionsPrompt({ city: cityName, season });
    console.log("🔄 Prompt built, calling OpenAI...");
  
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "You are Angela, TripWell's travel assistant. Return structured JSON only. No prose. No markdown." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
    });

    console.log("✅ OpenAI call completed");
    const content = completion.choices[0].message.content || "[]";
    console.log("🔄 Raw response length:", content.length);
    
    // Parse the JSON - handle single quotes by converting to double quotes
    let parsedArray;
    try {
      parsedArray = JSON.parse(content);
      console.log("✅ JSON parsed successfully, attractions count:", parsedArray.length);
    } catch (error) {
      console.log("⚠️ JSON parse failed, trying single quote conversion...");
      // If JSON parsing fails, try converting single quotes to double quotes
      const jsonString = content.replace(/'/g, '"');
      parsedArray = JSON.parse(jsonString);
      console.log("✅ JSON parsed after conversion, attractions count:", parsedArray.length);
    }
    
    // Save to database
    console.log("🔄 Saving to database...");
    const metaAttractions = new MetaAttractions({
      cityId: cityId,
      cityName: cityName,
      season: season,
      metaAttractions: parsedArray,
      status: 'meta_generated'
    });

    await metaAttractions.save();
    console.log("✅ Meta attractions saved to database:", metaAttractions._id);
    
    return { 
      rawResponse: content,
      data: parsedArray,
      metaAttractionsId: metaAttractions._id
    };
    
  } catch (error) {
    console.error("❌ Error in generateMetaAttractions:", error);
    throw error;
  }
}

module.exports = { generateMetaAttractions };
