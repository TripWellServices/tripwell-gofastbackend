// Test Profile Generation Script
// Tests the profile generation pipeline with different Paris profiles

const axios = require('axios');

// Test profiles for Paris
const testProfiles = [
  {
    profileSlug: "ParisBudgetAdventure",
    inputVariables: {
      city: "Paris",
      season: "Spring",
      purpose: "Explore culture on a budget",
      whoWith: "solo",
      priorities: ["Culture & History", "Adventure & Outdoor"],
      vibes: ["Authentic & Local"],
      mobility: ["Love walking everywhere"],
      travelPace: ["Fast Paced"],
      budget: "$50-100/day"
    }
  },
  {
    profileSlug: "ParisLuxuryRomantic",
    inputVariables: {
      city: "Paris",
      season: "Summer",
      purpose: "Romantic anniversary celebration",
      whoWith: "spouse",
      priorities: ["Food & Dining", "Relaxation & Wellness"],
      vibes: ["Romantic & Intimate", "Luxurious & Upscale"],
      mobility: ["Prefer transport options"],
      travelPace: ["Moderate - Balanced activities"],
      budget: "$800-1200/day"
    }
  },
  {
    profileSlug: "ParisFamilyEducational",
    inputVariables: {
      city: "Paris",
      season: "Fall",
      purpose: "Educational family vacation with kids",
      whoWith: "spouse-kids",
      priorities: ["Culture & History", "Adventure & Outdoor"],
      vibes: ["Social & Fun"],
      mobility: ["Mix of walking and transport"],
      travelPace: ["Moderate - Balanced activities"],
      budget: "$200-350/day"
    }
  }
];

async function testProfileGeneration() {
  console.log("🧪 Testing Profile Generation Pipeline...\n");

  for (const profile of testProfiles) {
    console.log(`\n=== Testing ${profile.profileSlug} ===`);
    
    try {
      // Step 1: Call GPT route
      console.log("1. Calling GPT route...");
      const gptResponse = await axios.post('http://localhost:3000/tripwell/profile-gpt', {
        profileSlug: profile.profileSlug,
        inputVariables: profile.inputVariables
      });
      
      if (gptResponse.data.status !== "ok") {
        throw new Error(`GPT route failed: ${gptResponse.data.message}`);
      }
      
      console.log("✅ GPT route successful");
      
      // Step 2: Call parser route
      console.log("2. Calling parser route...");
      const parserResponse = await axios.post('http://localhost:3000/tripwell/profile-parser', {
        rawResponse: gptResponse.data.rawResponse
      });
      
      if (parserResponse.data.status !== "ok") {
        throw new Error(`Parser route failed: ${parserResponse.data.message}`);
      }
      
      console.log("✅ Parser route successful");
      console.log(`   Generated: ${parserResponse.data.profileData.attractions.length} attractions, ${parserResponse.data.profileData.restaurants.length} restaurants`);
      
      // Step 3: Call save route
      console.log("3. Calling save route...");
      const saveResponse = await axios.post('http://localhost:3000/tripwell/profile-save', {
        profileSlug: profile.profileSlug,
        inputVariables: profile.inputVariables,
        profileData: parserResponse.data.profileData
      });
      
      if (saveResponse.data.status !== "ok") {
        throw new Error(`Save route failed: ${saveResponse.data.message}`);
      }
      
      console.log("✅ Save route successful");
      console.log(`   Saved: ${saveResponse.data.counts.attractions} attractions, ${saveResponse.data.counts.restaurants} restaurants, ${saveResponse.data.counts.mustSee} must-see, ${saveResponse.data.counts.mustDo} must-do`);
      
    } catch (error) {
      console.error(`❌ ${profile.profileSlug} failed:`, error.message);
    }
    
    // Small delay between profiles
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log("\n🎯 Profile Generation Test Complete!");
}

// Run the test
testProfileGeneration().catch(console.error);
