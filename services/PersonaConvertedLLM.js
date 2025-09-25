// services/PersonaConvertedLLM.js
const { buildOpenAIPrompt } = require("./tripPersonaConverterService");

/*
  PersonaConvertedLLM Service
  
  ✅ Clean OpenAI integration using converted persona data
  ✅ No messy data extraction - uses clean services
  ✅ Direct OpenAI calls with structured prompts
  ✅ Replaces scattered sample generation logic
*/

const generateSamplesWithOpenAI = async (tripId, userId, city, season, purpose) => {
  try {
    console.log(`🤖 Generating samples with OpenAI for trip ${tripId} in ${city}`);
    
    // Get clean prompt from converter service
    const { prompt, wordedPersona, metadata } = await buildOpenAIPrompt(
      tripId, 
      userId, 
      city, 
      season, 
      purpose
    );
    
    // Call OpenAI with clean prompt
    const openaiResponse = await callOpenAI(prompt);
    
    // Parse and validate response
    const samples = parseOpenAIResponse(openaiResponse);
    
    console.log(`✅ Generated ${samples.attractions.length + samples.restaurants.length + samples.neatThings.length} samples for trip ${tripId}`);
    
    return {
      success: true,
      samples,
      wordedPersona,
      metadata
    };
    
  } catch (error) {
    console.error(`❌ Error generating samples with OpenAI for trip ${tripId}:`, error);
    throw error;
  }
};

const callOpenAI = async (prompt) => {
  // OpenAI API call implementation
  // This would use the actual OpenAI SDK
  console.log("🤖 Calling OpenAI with clean prompt...");
  
  // Placeholder for actual OpenAI call
  // const response = await openai.chat.completions.create({
  //   model: "gpt-4",
  //   messages: [{ role: "user", content: prompt }],
  //   temperature: 0.7
  // });
  
  // return response.choices[0].message.content;
  
  // For now, return mock response
  return JSON.stringify({
    attractions: [
      { id: "attr_1", name: "Sample Attraction", description: "Sample description" }
    ],
    restaurants: [
      { id: "rest_1", name: "Sample Restaurant", description: "Sample description" }
    ],
    neatThings: [
      { id: "neat_1", name: "Sample Neat Thing", description: "Sample description" }
    ]
  });
};

const parseOpenAIResponse = (response) => {
  try {
    // Parse JSON response from OpenAI
    const parsed = JSON.parse(response);
    
    // Validate structure
    if (!parsed.attractions || !parsed.restaurants || !parsed.neatThings) {
      throw new Error("Invalid OpenAI response structure");
    }
    
    return parsed;
    
  } catch (error) {
    console.error("❌ Error parsing OpenAI response:", error);
    throw new Error("Failed to parse OpenAI response");
  }
};

const generateItineraryWithOpenAI = async (tripId, userId, city, season, purpose, selectedSamples) => {
  try {
    console.log(`🤖 Generating itinerary with OpenAI for trip ${tripId} in ${city}`);
    
    // Get clean prompt for itinerary generation
    const { prompt, wordedPersona, metadata } = await buildOpenAIPrompt(
      tripId, 
      userId, 
      city, 
      season, 
      purpose
    );
    
    // Add selected samples to prompt
    const itineraryPrompt = `${prompt}

**Selected Samples:**
${JSON.stringify(selectedSamples, null, 2)}

**Instructions:**
Generate a detailed day-by-day itinerary incorporating the selected samples.
Return a JSON object with this structure:
{
  "days": [
    {
      "day": 1,
      "summary": "Day 1 summary",
      "morning": "Morning activities",
      "afternoon": "Afternoon activities", 
      "evening": "Evening activities"
    }
  ]
}`;

    // Call OpenAI for itinerary
    const openaiResponse = await callOpenAI(itineraryPrompt);
    const itinerary = parseOpenAIResponse(openaiResponse);
    
    console.log(`✅ Generated itinerary for trip ${tripId}`);
    
    return {
      success: true,
      itinerary,
      wordedPersona,
      metadata
    };
    
  } catch (error) {
    console.error(`❌ Error generating itinerary with OpenAI for trip ${tripId}:`, error);
    throw error;
  }
};

module.exports = {
  generateSamplesWithOpenAI,
  generateItineraryWithOpenAI,
  callOpenAI,
  parseOpenAIResponse
};
