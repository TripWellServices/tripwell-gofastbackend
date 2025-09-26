const ItineraryDays = require("../../models/TripWell/ItineraryDays");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * ModifyBlockPlanner Service
 * 
 * ✅ Modifies ItineraryDays (planning phase)
 * ✅ Uses structured JSON output
 * ✅ Updates planning itinerary before trip starts
 */

async function modifyBlockPlanner({ tripId, dayIndex, block, feedback }) {
  try {
    console.log(`🎯 Modifying planning block: Trip ${tripId}, Day ${dayIndex}, Block ${block}`);
    
    // Get current itinerary
    const itinerary = await ItineraryDays.findOne({ tripId });
    if (!itinerary) {
      throw new Error("Itinerary not found for this trip");
    }

    // Find the specific day
    const day = itinerary.parsedDays.find(d => d.dayIndex === dayIndex);
    if (!day) {
      throw new Error(`Day ${dayIndex} not found in itinerary`);
    }

    // Get current block
    const currentBlock = day.blocks[block];
    if (!currentBlock) {
      throw new Error(`Block ${block} not found for day ${dayIndex}`);
    }

    console.log("📋 Current block:", currentBlock);

    // Build modification prompt
    const prompt = buildModificationPrompt({
      currentBlock,
      feedback,
      dayIndex,
      block
    });

    console.log("🤖 Calling OpenAI for block modification...");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "You are Angela, TripWell's travel assistant. Modify the itinerary block based on user feedback. Return structured JSON only." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) throw new Error("No GPT output received.");

    let modifiedBlock;
    try {
      modifiedBlock = JSON.parse(content);
    } catch (error) {
      // Handle malformed JSON
      const jsonString = content.replace(/'/g, '"');
      modifiedBlock = JSON.parse(jsonString);
    }

    console.log("✅ Modified block:", modifiedBlock);

    // Update the itinerary
    const updateQuery = {
      [`parsedDays.${dayIndex - 1}.blocks.${block}`]: {
        activity: modifiedBlock.activity,
        type: modifiedBlock.type,
        persona: modifiedBlock.persona,
        budget: modifiedBlock.budget
      }
    };

    await ItineraryDays.findOneAndUpdate(
      { tripId },
      { $set: updateQuery },
      { new: true }
    );

    // Return updated itinerary
    const updatedItinerary = await ItineraryDays.findOne({ tripId });
    
    console.log("✅ Planning block modified successfully");
    
    return {
      success: true,
      updatedBlock: modifiedBlock,
      updatedItinerary: updatedItinerary
    };

  } catch (error) {
    console.error("❌ Modify block planner error:", error);
    throw error;
  }
}

function buildModificationPrompt({ currentBlock, feedback, dayIndex, block }) {
  return `
Modify this itinerary block based on user feedback:

**Current Block (Day ${dayIndex}, ${block}):**
- Activity: ${currentBlock.activity}
- Type: ${currentBlock.type}
- Persona: ${currentBlock.persona}
- Budget: ${currentBlock.budget}

**User Feedback:**
${feedback}

**Instructions:**
- Modify the activity based on the feedback
- Keep the same structure and format
- Ensure the new activity fits the persona and budget level
- Make it realistic and actionable

**Return JSON with this exact structure:**
{
  "activity": "New activity name",
  "type": "attraction|restaurant|activity|transport|free_time",
  "persona": "art|foodie|history|adventure",
  "budget": "budget|moderate|luxury"
}

Return only the JSON object. No explanations or markdown.
`.trim();
}

module.exports = {
  modifyBlockPlanner
};
