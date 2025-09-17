const TripPersona = require("../../models/TripWell/TripPersona");
const TripBase = require("../../models/TripWell/TripBase");
const { OpenAI } = require("openai");
const openai = new OpenAI();

async function generateItineraryFromMetaLogic(tripId, userId, selectedMetas = [], selectedSamples = []) {
  try {
    const tripBase = await TripBase.findById(tripId);
    const tripPersona = await TripPersona.findOne({ tripId, userId });

    if (!tripPersona || !tripBase) {
      throw new Error("Missing trip data or persona.");
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
The purpose of this trip is "${purpose || "to enjoy and explore"}", and it is being taken with ${whoWith || "unspecified"}.

The traveler has selected meta attractions they want to include — these are the obvious tourist attractions they *want to do*. Use them to shape the itinerary structure. Meta attractions reflect the *user's must-see priorities* — do not ignore them.

**Persona Integration:**
The traveler's persona weights are: ${JSON.stringify(tripPersona.personas)}
- Art & Culture: ${tripPersona.personas.art}
- Food & Dining: ${tripPersona.personas.foodie}  
- Adventure & Outdoor: ${tripPersona.personas.adventure}
- History & Heritage: ${tripPersona.personas.history}

Additional factors:
- Romance Level: ${tripPersona.romanceLevel}
- Caretaker Role: ${tripPersona.caretakerRole}
- Flexibility: ${tripPersona.flexibility}
- Adult Level: ${tripPersona.adultLevel}

Each day of the trip should include:
- A brief day summary
- Morning activities
- Afternoon activities
- Evening activities

**Meta integration guidance:**
- Spread selected meta attractions across the trip days to ensure variety and pacing
- Use one meta attraction per day (typically), unless two fit naturally together
- For meta attractions that are full-day experiences, structure the day around that location
- Group nearby meta attractions to avoid inefficient travel
- Include food/cultural moments, especially in the afternoon or evening
- Avoid packing too much into a single day unless the flexibility allows for it

**Persona-based recommendations:**
- Prioritize activities that match the highest persona weights
- Consider romance level for evening activities
- Factor in caretaker role for family-friendly options
- Use flexibility level to determine how structured vs spontaneous the day should be
- Consider adult level for appropriate activity selection

**Day 0** is the travel day — keep it light, flexible, and optional

All days (0 through ${daysTotal}) must include:
- Real calendar dates
- Accurate weekdays
- A well-paced mix of activity, rest, and delight
- "Why" explanations for each recommendation based on persona weights

You will be provided:
- A calendar map of the trip
- The selected meta attractions to integrate
- The trip persona with weights and factors

Output should follow this exact format:

Day X – {Weekday}, {Month Day}  
Summary of the day: ...

Morning:
• [Activity] - [Why this fits their persona: art/foodie/adventure/history + romance/caretaker/flexibility factors]

Afternoon:
• [Activity] - [Why this fits their persona: art/foodie/adventure/history + romance/caretaker/flexibility factors]

Evening:
• [Activity] - [Why this fits their persona: art/foodie/adventure/history + romance/caretaker/flexibility factors]

Only include Day 0 through Day ${daysTotal} — no extras.
`.trim();

    const userPrompt = `
Here is the trip calendar:
${JSON.stringify(dayMap, null, 2)}

Here are the selected meta attractions to integrate:
${JSON.stringify(selectedMetas, null, 2)}

Here is the trip persona with weights:
${JSON.stringify(tripPersona, null, 2)}

Here are the selected samples that influenced the persona weights:
${JSON.stringify(selectedSamples, null, 2)}
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

module.exports = { generateItineraryFromMetaLogic };
