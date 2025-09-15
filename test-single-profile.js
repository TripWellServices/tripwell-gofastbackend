// Test Single Profile Generation
// Tests one Paris profile to see if the pipeline works

const axios = require('axios');

// Single test profile
const testProfile = {
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
};

async function testSingleProfile() {
  console.log("🧪 Testing Single Profile Generation...\n");
  console.log(`Profile: ${testProfile.profileSlug}`);
  console.log(`Budget: ${testProfile.inputVariables.budget}`);
  console.log(`Priorities: ${testProfile.inputVariables.priorities.join(", ")}\n`);

  try {
    // Step 1: Call GPT route
    console.log("1. Calling GPT route...");
    const gptResponse = await axios.post('http://localhost:3000/tripwell/profile-gpt', {
      profileSlug: testProfile.profileSlug,
      inputVariables: testProfile.inputVariables
    });
    
    if (gptResponse.data.status !== "ok") {
      throw new Error(`GPT route failed: ${gptResponse.data.message}`);
    }
    
    console.log("✅ GPT route successful");
    console.log(`   Raw response length: ${gptResponse.data.rawResponse.length} characters`);
    
    // Step 2: Call parser route
    console.log("\n2. Calling parser route...");
    const parserResponse = await axios.post('http://localhost:3000/tripwell/profile-parser', {
      rawResponse: gptResponse.data.rawResponse
    });
    
    if (parserResponse.data.status !== "ok") {
      throw new Error(`Parser route failed: ${parserResponse.data.message}`);
    }
    
    console.log("✅ Parser route successful");
    const profileData = parserResponse.data.profileData;
    console.log(`   Generated:`);
    console.log(`   - ${profileData.attractions.length} attractions`);
    console.log(`   - ${profileData.restaurants.length} restaurants`);
    console.log(`   - ${profileData.mustSee.length} must-see`);
    console.log(`   - ${profileData.mustDo.length} must-do`);
    
    // Show first attraction as preview
    if (profileData.attractions.length > 0) {
      console.log(`   Preview attraction: "${profileData.attractions[0].name}"`);
    }
    
    // Step 3: Call save route
    console.log("\n3. Calling save route...");
    const saveResponse = await axios.post('http://localhost:3000/tripwell/profile-save', {
      profileSlug: testProfile.profileSlug,
      inputVariables: testProfile.inputVariables,
      profileData: profileData
    });
    
    if (saveResponse.data.status !== "ok") {
      throw new Error(`Save route failed: ${saveResponse.data.message}`);
    }
    
    console.log("✅ Save route successful");
    console.log(`   Profile ID: ${saveResponse.data.profileId}`);
    console.log(`   Saved:`);
    console.log(`   - ${saveResponse.data.counts.attractions} attractions`);
    console.log(`   - ${saveResponse.data.counts.restaurants} restaurants`);
    console.log(`   - ${saveResponse.data.counts.mustSee} must-see`);
    console.log(`   - ${saveResponse.data.counts.mustDo} must-do`);
    
    console.log("\n🎯 Single Profile Test Complete! Check your database!");
    
  } catch (error) {
    console.error(`❌ Test failed:`, error.message);
    if (error.response) {
      console.error(`   Response:`, error.response.data);
    }
  }
}

// Run the test
testSingleProfile().catch(console.error);
