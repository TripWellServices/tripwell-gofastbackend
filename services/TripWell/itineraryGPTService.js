const TripIntent = require("../../models/TripWell/TripIntent");
const TripBase = require("../../models/TripWell/TripBase");
const AnchorLogic = require("../../models/TripWell/AnchorLogic");
const { OpenAI } = require("openai");
const openai = new OpenAI();

async function generateItineraryFromAnchorLogic(tripId) {
  try {
    const tripBase = await TripBase.findById(tripId);
    const tripIntent = await TripIntent.findOne({ tripId });
    const anchorLogicList = await AnchorLogic.find({ tripId });

    if (!tripIntent || !tripBase || anchorLogicList.length === 0) {
      throw new Error("Missing trip data or anchors.");
    }

    const { city, season, startDate, daysTotal, purpose, whoWith } = tripBase;

    const start = new Date(startDate);
    const dayMap = Array.from({ length: daysTotal + 1 }).map((_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + (i - 1));
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

You are building a ${daysTotal}-day itinerary for a trip to ${city} during the ${season}.
The purpose of this trip is "${purpose || "to enjoy and explore"}", and it is being taken with ${whoWith?.join(", ") || "unspecified"}.

The traveler has already selected anchor experiences — these are core experiences they *want to do*. Use them to shape the itinerary structure. Anchors reflect the *user’s intent and priorities* — do not ignore them.

Each day of the trip should include:
- A brief day summary
- Morning activities
- Afternoon activities
- Evening activities

**Anchor integration guidance:**
- Spread anchors across the trip days to ensure variety and pacing
- Use one anchor per day (typically), unless two fit naturally together
- For anchors marked as \`isDayTrip: true\`, treat them as full-day excursions and structure the day around that location
- Group nearby anchors to avoid inefficient travel
- Include food/cultural moments, especially in the afternoon or evening
- Avoid packing too much into a single day unless the vibe allows for it

**Day 0** is the travel day — keep it light, flexible, and optional

All days (0 through ${daysTotal}) must include:
- Real calendar dates
- Accurate weekdays
- A well-paced mix of activity, rest, and delight

You will be provided:
- A calendar map of the trip
- The anchor experiences to integrate
- The original trip intent form

Output should follow this exact format:

Day X – {Weekday}, {Month Day}  
Summary of the day: ...

Morning:
• ...

Afternoon:
• ...

Evening:
• ...

Only include Day 0 through Day ${daysTotal} — no extras.
`.trim();

    const userPrompt = `
Here is the trip calendar:
${JSON.stringify(dayMap, null, 2)}

Here are the selected anchor experiences:
${JSON.stringify(anchorLogicList[0]?.enrichedAnchors || [], null, 2)}

Here is the trip intent:
${JSON.stringify(tripIntent, null, 2)}
`.trim();

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

    return content.trim();
  } catch (error) {
    console.error("Angela itinerary generation error:", error);
    throw error;
  }
}

module.exports = { generateItineraryFromAnchorLogic };
