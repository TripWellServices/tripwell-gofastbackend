require('dotenv').config();

// Test just the prompt generation without database calls
function testPromptGeneration() {
  console.log('🧪 Testing prompt generation logic...');
  
  // Mock data
  const tripBase = {
    city: 'Paris',
    season: 'Summer',
    startDate: new Date('2025-09-22'),
    daysTotal: 5,
    purpose: 'Romantic getaway',
    whoWith: 'couple',
    arrivalTime: '14:30'
  };
  
  const tripPersona = {
    primaryPersona: 'art',
    budget: 300,
    travelPace: 'moderate',
    personas: { art: 0.6, foodie: 0.1, adventure: 0.1, history: 0.2 },
    romanceLevel: 0.4,
    caretakerRole: 0.1,
    flexibility: 0.2,
    adultLevel: 0.3
  };
  
  const tripWellUser = {
    planningFlex: 0.7,
    tripPreferenceFlex: 0.8
  };
  
  const selectedMetas = [
    {
      name: 'Eiffel Tower',
      description: 'Iconic iron lattice tower and symbol of Paris'
    },
    {
      name: 'Louvre Museum', 
      description: 'World-famous art museum with Mona Lisa'
    }
  ];
  
  const selectedSamples = [
    {
      name: 'Le Comptoir du Relais',
      type: 'restaurant',
      why_recommended: 'Perfect for foodie persona - authentic French bistro'
    },
    {
      name: 'Montmartre Walking Tour',
      type: 'attraction', 
      why_recommended: 'Great for art persona - historic artist quarter'
    }
  ];

  // Generate dayMap
  const start = new Date(tripBase.startDate);
  const dayMap = Array.from({ length: tripBase.daysTotal }).map((_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return {
      dayIndex: i + 1,
      dayNumber: i + 1,
      isoDate: date.toISOString().split("T")[0],
      weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
      formatted: date.toLocaleDateString("en-US", { month: "long", day: "numeric" }),
      label: `Day ${i + 1} – ${date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric"
      })}`
    };
  });

  // Generate system prompt
  const systemPrompt = `
You are Angela, a highly intuitive AI travel planner.

You are building a ${tripBase.daysTotal}-day itinerary for a trip to ${tripBase.city} during the ${tripBase.season}.
The purpose of this trip is "${tripBase.purpose || "to enjoy and explore"}", and it is being taken with ${tripBase.whoWith || "unspecified"}.

**Selected Meta Attractions (MUST INCLUDE):**
${selectedMetas.length > 0 ? selectedMetas.map(meta => `- ${meta.name}: ${meta.description}`).join('\n') : 'No specific meta attractions selected'}

**Selected Sample Preferences (LEARNED FROM USER CHOICES):**
${selectedSamples.length > 0 ? selectedSamples.map(sample => `- ${sample.name} (${sample.type}): ${sample.why_recommended}`).join('\n') : 'No sample preferences selected'}

**Persona Integration:**
The traveler's persona weights are: ${JSON.stringify(tripPersona.personas)}
- Art & Culture: ${tripPersona.personas.art}
- Food & Dining: ${tripPersona.personas.foodie}  
- Adventure & Outdoor: ${tripPersona.personas.adventure}
- History & Heritage: ${tripPersona.personas.history}

**Trip Intent Data:**
- Primary Persona: ${tripPersona.primaryPersona}
- Daily Budget: $${tripPersona.budget}
- Travel Pace: ${tripPersona.travelPace}

**ProfileSetup Enduring Weights:**
- Planning Flexibility: ${tripWellUser?.planningFlex || 0.5} (0.2=rigid, 0.5=mixed, 0.8=spontaneous)
- Trip Preference Flexibility: ${tripWellUser?.tripPreferenceFlex || 0.5} (0.2=stick to schedule, 0.6=enjoy moment, 0.8=go with flow)

**Derived Personality Factors:**
- Romance Level: ${tripPersona.romanceLevel}
- Caretaker Role: ${tripPersona.caretakerRole}
- Flexibility: ${tripPersona.flexibility}
- Adult Level: ${tripPersona.adultLevel}

Each day of the trip should include:
- A brief day summary
- Morning activities
- Afternoon activities
- Evening activities

**Meta Integration (CRITICAL):**
- MUST include all selected meta attractions in the itinerary
- Spread selected meta attractions across the trip days to ensure variety and pacing
- Use one meta attraction per day (typically), unless two fit naturally together
- For meta attractions that are full-day experiences, structure the day around that location
- Group nearby meta attractions to avoid inefficient travel

**Sample Preference Integration:**
- Use selected sample preferences to guide similar recommendations
- If they selected specific restaurants, include similar dining experiences
- If they selected specific attractions, include similar cultural activities
- If they selected specific "neat things", include similar unique experiences

**Persona-Based Recommendations:**
- Prioritize activities that match the highest persona weights (${tripPersona.primaryPersona} is primary)
- Consider romance level (${tripPersona.romanceLevel}) for evening activities
- Factor in caretaker role (${tripPersona.caretakerRole}) for family-friendly options
- Use flexibility level (${tripPersona.flexibility}) to determine how structured vs spontaneous the day should be
- Consider adult level (${tripPersona.adultLevel}) for appropriate activity selection
- Budget: $${tripPersona.budget} per day - structure activities accordingly
- Travel Pace: ${tripPersona.travelPace} - adjust daily activity density

**ProfileSetup Integration:**
- Planning Flexibility (${tripWellUser?.planningFlex || 0.5}): ${tripWellUser?.planningFlex > 0.6 ? 'Include spontaneous options and flexible timing' : tripWellUser?.planningFlex < 0.4 ? 'Keep schedule structured and predictable' : 'Balance structure with flexibility'}
- Trip Preference Flexibility (${tripWellUser?.tripPreferenceFlex || 0.5}): ${tripWellUser?.tripPreferenceFlex > 0.6 ? 'Focus on experiences over strict scheduling' : tripWellUser?.tripPreferenceFlex < 0.4 ? 'Provide detailed timing and structure' : 'Mix planned activities with free time'}

**Day Indexing:**
- Day 1 (dayIndex: 1) = First day of trip
- Day 2+ (dayIndex: 2+) = Full trip days with activities

All days (1 through ${tripBase.daysTotal}) must include:
- Real calendar dates
- Accurate weekdays
- A well-paced mix of activity, rest, and delight
- "Why" explanations for each recommendation based on persona weights
`.trim();

  console.log('✅ Day Map Generated:');
  console.log(JSON.stringify(dayMap, null, 2));
  
  console.log('\n✅ System Prompt Generated:');
  console.log(systemPrompt);
  
  console.log('\n🎯 Test completed successfully!');
}

testPromptGeneration();
