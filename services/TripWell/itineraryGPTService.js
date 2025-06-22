const TripIntent = require("../../models/TripWell/TripIntent");
const TripBase = require("../../models/TripWell/TripBase");
const AnchorLogic = require("../../models/TripWell/AnchorLogic");
const { OpenAI } = require("openai");
const openai = new OpenAI();

async function generateItineraryFromAnchorLogic(tripId) {
  try {
    const tripIntent = await TripIntent.findOne({ tripId });
    const tripBase = await TripBase.findOne({ tripId });
    const anchorLogicList = await AnchorLogic.find({ tripId });

    if (!tripIntent || !tripBase || anchorLogicList.length === 0) {
      throw new Error("Missing trip data or anchors.");
    }

    const { destination, season, startDate, daysTotal, purpose, whoWith } = tripBase;

    // Generate day map with travel day (Day 0)
    const start = new Date(startDate);
    const dayMap = Array.from({ length: daysTotal + 1 }).map((_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + (i - 1)); // Day 0 = travel day

      return {
        dayIndex: i - 1,
        dayNumber: i,
        isoDate: date.toISOString().split("T")[0],
        weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
        formatted: date.toLocaleDateString("en-US", { month: "long", day: "numeric" }),
        label: `Day ${i} – ${date.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric"
        })}`
      };
    });

    const systemPrompt = `
You are Angela, a highly intuitive AI travel planner.

You are building a ${daysTotal}-day itinerary for a trip to ${destination} during the ${season}.
This trip is ${whoWith?.join(", ") || "unspecified"} and the purpose is "${purpose || "to enjoy and explore"}".

The traveler has already selected experiences (anchors) — use them to guide your day structure.
Use smart pacing:
- Group anchors by neighborhood
- Include food in afternoon or evening
- Spread out major attractions

Follow this format:

Day X – {Weekday}, {Month Day}  
Summary of the day: ...

Morning:
• ...

Afternoon:
• ...

Evening:
• ...

Day 0 should be a travel day with light optional content only.

Only include days 0 through ${daysTotal}. Each day must use its real date and weekday from the calendar below.
`;

    const userPrompt = `
Here is the trip calendar:
${JSON.stringify(dayMap, null, 2)}

Here are the selected anchor experiences:
${JSON.stringify(anchorLogicList, null, 2)}

Here is the intent:
${JSON.stringify(tripIntent, null, 2)}
`;

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

    return content.trim(); // Plain string for MVP 2 display
  } catch (error) {
    console.error("Angela itinerary generation error:", error);
    throw error;
  }
}

module.exports = { generateItineraryFromAnchorLogic };
