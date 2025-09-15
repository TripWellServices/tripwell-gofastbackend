const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🧠 GPT prompt builder for place-specific todo generation
function buildPlaceTodoPrompt({ city, season, purpose, whoWith, priorities, vibes, mobility, travelPace, budget, metaAttractions }) {
  return `
You are Angela, TripWell's smart travel planner. Your core mission: BUILD MEMORIES, not generic recommendations.

**MEMORY-BUILDING ALGORITHM:**
- **Attractions**: Places you go to create lasting memories
- **Must Dos**: Once-in-a-lifetime experiences that define the trip
- **Restaurants**: Budget-conscious dining that matches travel style and companions
- **Must Sees**: Hidden gems, neighborhood views, rooftop experiences - beyond the obvious

**TRAVELER PROFILE:**
- **Destination**: ${city} in ${season}
- **Purpose**: ${purpose || "exploration"}
- **Traveling with**: ${Array.isArray(whoWith) ? whoWith.join(", ") : whoWith || "solo"}
- **Priorities**: ${priorities?.join(", ") || "general exploration"}
- **Vibe**: ${vibes?.join(", ") || "flexible"}
- **Mobility**: ${mobility?.join(", ") || "flexible"}
- **Pace**: ${travelPace?.join(", ") || "moderate"}

**BUDGET META LAYER - ${budget}:**
${budget === "Budget ($50-100/day)" ? `
- Daily budget: $50-100
- Accommodation: $25-40/night (hostels, budget hotels)
- Food: $20-35/day (street food, local cafes, budget restaurants)
- Activities: $15-25/day (free walking tours, budget attractions, public transport)
- Focus: Authentic local experiences, free cultural sites, street food, public transport
` : budget === "Mid-range ($100-200/day)" ? `
- Daily budget: $100-200
- Accommodation: $50-80/night (mid-range hotels, Airbnbs)
- Food: $40-70/day (local restaurants, some upscale dining)
- Activities: $30-50/day (guided tours, museum passes, some premium experiences)
- Focus: Balanced mix of local and tourist experiences, comfortable dining
` : budget === "Luxury ($200+/day)" ? `
- Daily budget: $200+
- Accommodation: $100+/night (luxury hotels, premium Airbnbs)
- Food: $80+/day (fine dining, premium restaurants, wine tastings)
- Activities: $50+/day (private tours, exclusive experiences, premium attractions)
- Focus: Premium experiences, fine dining, exclusive access, comfort
` : `
- Budget: ${budget}
- Focus: Tailor recommendations to this specific budget level
`}

**MOBILITY CONTEXT - HOW YOU MOVE THROUGH THE CITY:**
${mobility?.includes("Love walking everywhere") ? `
- WALKING FOCUS: Prioritize walkable areas, pedestrian-friendly routes
- Consider: Walking tours, neighborhood exploration, parks, pedestrian streets
- Avoid: Places requiring long metro rides, car-dependent locations
- Distance: Keep attractions within 15-20 minute walking distance of each other
- Safety: Well-lit, populated walking routes, especially for solo travelers
` : mobility?.includes("Mix of walking and transport") ? `
- MIXED MOBILITY: Balance walking with public transport
- Consider: Metro-accessible areas, walkable neighborhoods, transport hubs
- Distance: Can handle 30-45 minute metro rides + 10-15 minute walks
- Efficiency: Group nearby attractions, use transport for longer distances
- Flexibility: Can adapt to weather and energy levels
` : mobility?.includes("Prefer transport options") ? `
- TRANSPORT FOCUS: Minimize walking, maximize convenience
- Consider: Metro-accessible attractions, taxi/ride-share friendly locations
- Distance: Keep walking to under 10 minutes, use transport for everything else
- Convenience: Near metro stations, major transport hubs, accessible entrances
- Comfort: Avoid long walks, prioritize ease of access
` : mobility?.includes("Need accessible routes") ? `
- ACCESSIBILITY FOCUS: Ensure all recommendations are accessible
- Consider: Wheelchair accessible venues, elevators, ramps, accessible transport
- Distance: Minimize walking, prioritize accessible transport options
- Safety: Well-maintained paths, accessible restrooms, clear signage
- Support: Accessible hotels, restaurants, attractions with proper facilities
` : `
- Mobility: ${mobility?.join(", ") || "flexible"}
- Consider: Adapt recommendations to mobility preferences
`}

**WHO WITH CONTEXT:**
${whoWith === "solo" ? `
- Solo traveler: Focus on social opportunities, safe neighborhoods, solo-friendly activities
- Consider: Hostels with common areas, walking tours, solo dining options, safety
` : whoWith === "spouse" ? `
- Couple: Focus on romantic experiences, intimate settings, shared activities
- Consider: Romantic restaurants, couple activities, private experiences, photo opportunities
` : whoWith === "spouse-kids" ? `
- Family with kids: Focus on kid-friendly activities, family dining, educational experiences
- Consider: Family restaurants, kid-safe attractions, educational sites, family-friendly pacing
` : whoWith === "son-daughter" ? `
- Parent-child: Focus on bonding experiences, educational opportunities, age-appropriate activities
- Consider: Interactive museums, shared learning, quality time, age-appropriate dining
` : whoWith === "friends" ? `
- Friends group: Focus on social activities, group dining, shared experiences, nightlife
- Consider: Group-friendly restaurants, social activities, shared accommodations, group dynamics
` : `
- Traveling with: ${whoWith}
- Consider: Group dynamics, shared interests, group-friendly activities
`}

**META ATTRACTIONS TO AVOID:**
${metaAttractions ? metaAttractions.map(attr => `- ${attr.name} (${attr.type}): ${attr.reason}`).join('\n') : 'No meta attractions provided'}

**CRITICAL INSTRUCTION: DO NOT RECOMMEND ANY OF THE ABOVE META ATTRACTIONS!**

**SECTION-SPECIFIC GUIDANCE:**

**ATTRACTIONS** (5-7 recommendations):
- **AVOID ALL META ATTRACTIONS ABOVE** - these are generic tourist traps
- Focus on memory-building places that match the traveler's priorities and budget
- Consider season-specific experiences (${season} in ${city})
- Find hidden gems, local favorites, and unique experiences
- Ensure accessibility matches mobility preferences (${mobility?.join(", ")})
- Align with travel pace (${travelPace?.join(", ")})
- Think like a local, not a tourist guide

**RESTAURANTS** (3-5 recommendations):
- Match budget allocation for food (see budget meta layer above)
- Consider dining style for ${whoWith} (solo, couple, family, friends)
- Include local specialties and seasonal dishes
- Balance quick bites with sit-down experiences
- Consider dietary preferences and group dynamics

**MUST SEE** (3-5 recommendations):
- Hidden gems, neighborhood views, rooftop experiences
- Beyond the obvious tourist spots
- Unique ${city} experiences that create lasting memories
- Consider ${season} timing and weather
- Match traveler's interests and energy level

**MUST DO** (3-5 recommendations):
- Once-in-a-lifetime experiences that define the trip
- Activities that create stories and memories
- Consider group size and dynamics (${whoWith})
- Match budget and time constraints
- Align with priorities: ${priorities?.join(", ")}

Respond only with a JSON object containing:
- attractions: array of 5-7 attractions with { name, description, location, cost, whyChose }
- restaurants: array of 3-5 restaurants with { name, description, location, priceRange, whyChose }
- mustSee: array of 3-5 must-see experiences with { name, description, location, cost, whyChose }
- mustDo: array of 3-5 must-do experiences with { name, description, location, cost, whyChose }

For each "whyChose" field, explain in 1-2 sentences WHY this specific recommendation was chosen for THIS traveler profile. Consider their budget, who they're with, priorities, vibes, and season. Make it personal and specific.

Return only the raw JSON object. No explanations, markdown, or extra commentary.
`.trim();
}

// 🤖 Main GPT place todo generation service
async function generatePlaceTodos({ profileSlug, inputVariables, metaAttractions }) {
  if (!profileSlug || !inputVariables) {
    throw new Error("Missing required fields: profileSlug, inputVariables");
  }

  console.log("🔍 Generating place todos for profile:", profileSlug);
  console.log("🔍 Input variables:", inputVariables);
  console.log("🔍 Meta attractions to avoid:", metaAttractions?.length || 0);

  // Build the prompt using the input variables
  const prompt = buildPlaceTodoPrompt({
    city: inputVariables.city,
    season: inputVariables.season,
    purpose: inputVariables.purpose,
    whoWith: inputVariables.whoWith,
    priorities: inputVariables.priorities,
    vibes: inputVariables.vibes,
    mobility: inputVariables.mobility,
    travelPace: inputVariables.travelPace,
    budget: inputVariables.budget,
    metaAttractions: metaAttractions
  });

  try {
    console.log("🧪 Calling OpenAI with personalized data...");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are Angela, TripWell's travel assistant. Return structured JSON only. No prose. No markdown."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1500
    });

    const responseText = response.choices[0].message.content;
    console.log("✅ OpenAI response received");

    return {
      success: true,
      profileSlug: profileSlug,
      rawResponse: responseText
    };

  } catch (error) {
    console.error("❌ OpenAI call failed:", error);
    throw new Error(`Failed to generate place todos: ${error.message}`);
  }
}

module.exports = {
  generatePlaceTodos,
  buildPlaceTodoPrompt
};
