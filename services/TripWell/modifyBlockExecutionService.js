const TripCurrentDays = require("../../models/TripWell/TripCurrentDays");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * ModifyBlockExecution Service
 * 
 * ✅ Modifies TripCurrentDays (live trip phase)
 * ✅ Uses structured JSON output
 * ✅ Updates live trip data during execution
 * ✅ Tracks user modifications for analysis
 */

async function modifyBlockExecution({ tripId, dayIndex, block, feedback }) {
  try {
    console.log(`🚀 Modifying live trip block: Trip ${tripId}, Day ${dayIndex}, Block ${block}`);
    
    // Get current live trip data
    const liveTrip = await TripCurrentDays.findOne({ tripId });
    if (!liveTrip) {
      throw new Error("Live trip not found for this trip");
    }

    // Find the specific day
    const day = liveTrip.days.find(d => d.dayIndex === dayIndex);
    if (!day) {
      throw new Error(`Day ${dayIndex} not found in live trip`);
    }

    // Get current block
    const currentBlock = day.blocks[block];
    if (!currentBlock) {
      throw new Error(`Block ${block} not found for day ${dayIndex}`);
    }

    console.log("📋 Current live block:", currentBlock);

    // Build modification prompt for live trip
    const prompt = buildLiveModificationPrompt({
      currentBlock,
      feedback,
      dayIndex,
      block,
      currentDay: liveTrip.currentDay
    });

    console.log("🤖 Calling OpenAI for live block modification...");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "You are Angela, TripWell's live travel assistant. Modify the live trip block based on real-time feedback. Return structured JSON only." 
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

    console.log("✅ Modified live block:", modifiedBlock);

    // Store original block for modification tracking
    const originalBlock = {
      activity: currentBlock.activity,
      type: currentBlock.type,
      persona: currentBlock.persona,
      budget: currentBlock.budget
    };

    // Update the live trip
    const updateQuery = {
      [`days.${dayIndex - 1}.blocks.${block}`]: {
        activity: modifiedBlock.activity,
        type: modifiedBlock.type,
        persona: modifiedBlock.persona,
        budget: modifiedBlock.budget
      }
    };

    // Add modification tracking
    const modificationEntry = {
      block: block,
      originalText: JSON.stringify(originalBlock),
      modifiedText: JSON.stringify(modifiedBlock),
      modifiedAt: new Date(),
      reason: feedback
    };

    const modificationQuery = {
      $push: {
        [`days.${dayIndex - 1}.userModifications`]: modificationEntry
      }
    };

    await TripCurrentDays.findOneAndUpdate(
      { tripId },
      { 
        $set: updateQuery,
        ...modificationQuery
      },
      { new: true }
    );

    // Return updated live trip
    const updatedLiveTrip = await TripCurrentDays.findOne({ tripId });
    
    console.log("✅ Live trip block modified successfully");
    
    return {
      success: true,
      updatedBlock: modifiedBlock,
      updatedLiveTrip: updatedLiveTrip
    };

  } catch (error) {
    console.error("❌ Modify block execution error:", error);
    throw error;
  }
}

function buildLiveModificationPrompt({ currentBlock, feedback, dayIndex, block, currentDay }) {
  const isCurrentDay = dayIndex === currentDay;
  const dayContext = isCurrentDay ? "TODAY" : `Day ${dayIndex}`;
  
  return `
Modify this live trip block based on real-time feedback:

**Current Block (${dayContext}, ${block}):**
- Activity: ${currentBlock.activity}
- Type: ${currentBlock.type}
- Persona: ${currentBlock.persona}
- Budget: ${currentBlock.budget}

**Real-time Feedback:**
${feedback}

**Live Trip Context:**
- This is a live modification during the actual trip
- Consider real-world constraints (time, location, availability)
- Make it actionable for immediate use
- Focus on practical alternatives

**Instructions:**
- Modify the activity based on the real-time feedback
- Keep the same structure and format
- Ensure the new activity fits the persona and budget level
- Make it realistic and immediately actionable
- Consider if this is happening today or a future day

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
  modifyBlockExecution
};
