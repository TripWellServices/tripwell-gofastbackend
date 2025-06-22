const TripIntent = require("../../models/TripWell/TripIntent");
const TripBase = require("../../models/TripWell/TripBase");
const AnchorLogic = require("../../models/TripWell/AnchorLogic");
const { OpenAI } = require("openai");
const openai = new OpenAI();

async function generateItineraryFromAnchorLogic(tripId) {
  try {
    // Fetch core trip data
    const tripIntent = await TripIntent.findOne({ tripId });
    const tripBase = await TripBase.findOne({ tripId });
    const anchorLogicList = await AnchorLogic.find({ tripId });

    if (!tripIntent || !tripBase || anchorLogicList.length === 0) {
      throw new Error("Missing required trip data.");
    }

    // Calculate totalDays from tripStart and tripEnd
    const start = new Date(tripBase.tripStart);
    const end = new Date(tripBase.tripEnd);
    const totalDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);

    // GPT Prompt Build
    const systemPrompt = `You are Angela, an intuitive travel planner. 
Your job is to build a ${totalDays}-day itinerary for a trip to ${tripIntent.destination}.
Use the anchor experiences provided. Distribute them across ${totalDays} days, balancing pace (${tripIntent.pace}) and trip vibe (${tripIntent.vibe}).
Make sure each day includes morning, lunch, afternoon, and evening blocks if possible.`;

    const userPrompt = {
      tripIntent,
      tripBase,
      totalDays,
      anchorLogicList,
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      temperature: 0.8,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Build the full itinerary based on this data:\n\n${JSON.stringify(userPrompt)}`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;

    // Try to parse response as JSON
    try {
      return JSON.parse(content);
    } catch (err) {
      throw new Error("Failed to parse GPT response as JSON.");
    }
  } catch (error) {
    console.error("Itinerary GPT Error:", error);
    throw error;
  }
}

module.exports = { generateItineraryFromAnchorLogic };
