const OpenAI = require("openai");
const mongoose = require("mongoose");

const TripIntent = require("../../models/TripWell/TripIntent");
const TripBase = require("../../models/TripWell/TripBase");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🧠 GPT prompt builder
function buildAnchorPrompt({ vibes, priorities, mobility, travelPace, budget, city, season, purpose, whoWith }) {
  return `
You are Angela, TripWell’s smart travel planner.

Suggest 5 immersive travel *anchor experiences* based on the traveler’s input. Anchor experiences are major parts of a trip — like a full-day excursion, iconic site visit, or themed cultural activity — that shape the rest of the day.

Traveler is going to **${city}** during **${season}**.  
Purpose of trip: ${purpose || "not specified"}  
Travel companions: ${Array.isArray(whoWith) ? whoWith.join(", ") : whoWith || "unspecified"}

Traveler Priorities:
The traveler emphasized these top trip priorities: **${priorities?.join(", ") || "no specific priorities"}**.  
Please scope your anchor suggestions around these interests.

Trip Vibe:
The intended vibe is **${vibes?.join(", ") || "flexible"}** — reflect this in the tone and energy of the experiences you suggest (e.g., romantic vs. playful, high-energy vs. relaxed).

Mobility & Travel Pace:
The traveler prefers to get around via **${mobility?.join(", ") || "any mode"}**.  
Please suggest anchors and follow-ons that are realistically accessible based on that. Avoid experiences that would require conflicting transportation methods.  
Preferred travel pace: **${travelPace?.join(", ") || "any"}**.

Budget Guidance:
The expected daily budget is **${budget || "flexible"}**.  
Structure your anchor experiences and follow-on suggestions to reflect that — i.e., a lower budget may favor local food tours or free cultural sites, while a higher budget may justify guided excursions or upscale experiences.

Respond only with an array of 5 JSON objects. Each object should contain:
- title (string)
- description (string)
- location (string)
- isDayTrip (boolean)
- suggestedFollowOn (string) – what the rest of the day looks like after this anchor

Return only the raw JSON array. No explanations, markdown, or extra commentary.
`.trim();
}

// 🤖 Main GPT anchor suggestion service
async function generateAnchorSuggestions({ tripId, userId }) {
  if (!tripId || !userId) throw new Error("Missing tripId or userId");

  // Hardcoded Paris anchors for now
  const hardcodedAnchors = [
    {
      title: "Eiffel Tower & Seine River Walk",
      description: "Start your Paris adventure with the iconic Eiffel Tower, then stroll along the Seine River taking in the romantic atmosphere and historic bridges.",
      location: "Eiffel Tower, 7th Arrondissement",
      isDayTrip: false,
      suggestedFollowOn: "Visit the nearby Trocadéro Gardens for the best photo ops, then explore the charming streets of the 7th arrondissement with dinner at a traditional bistro."
    },
    {
      title: "Louvre Museum & Tuileries Garden",
      description: "Immerse yourself in art history at the world's largest art museum, home to the Mona Lisa and countless masterpieces, followed by a peaceful walk in the formal gardens.",
      location: "Louvre Museum, 1st Arrondissement",
      isDayTrip: false,
      suggestedFollowOn: "Walk through the Tuileries Garden to Place de la Concorde, then explore the luxury shopping on Rue Saint-Honoré or enjoy a café break."
    },
    {
      title: "Notre-Dame & Île de la Cité",
      description: "Discover the heart of medieval Paris on the historic island, exploring the magnificent Notre-Dame Cathedral and the charming narrow streets that tell the city's oldest stories.",
      location: "Notre-Dame Cathedral, Île de la Cité",
      isDayTrip: false,
      suggestedFollowOn: "Cross to the Left Bank to explore the Latin Quarter's bookstores and cafés, or visit the Sainte-Chapelle for its stunning stained glass."
    },
    {
      title: "Montmartre & Sacré-Cœur",
      description: "Climb to the highest point in Paris to visit the stunning white basilica and explore the artistic neighborhood that inspired generations of painters and writers.",
      location: "Montmartre, 18th Arrondissement",
      isDayTrip: false,
      suggestedFollowOn: "Wander the cobblestone streets of Montmartre, visit Place du Tertre to see artists at work, and enjoy dinner at a traditional French restaurant."
    },
    {
      title: "Champs-Élysées & Arc de Triomphe",
      description: "Walk the world's most famous avenue from the Arc de Triomphe, taking in the luxury shops, cafés, and the grand architecture that defines Parisian elegance.",
      location: "Champs-Élysées, 8th Arrondissement",
      isDayTrip: false,
      suggestedFollowOn: "Visit the Arc de Triomphe for panoramic city views, then explore the nearby Parc Monceau or enjoy shopping and people-watching along the avenue."
    }
  ];

  return {
    anchors: hardcodedAnchors,
    raw: { hardcoded: true }
  };
}

module.exports = { generateAnchorSuggestions };
