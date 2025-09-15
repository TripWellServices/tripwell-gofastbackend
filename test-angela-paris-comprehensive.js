// Comprehensive Angela Paris Test Suite
// Tests 10 different user profiles to understand prompt weights and behavior
const { generateAnchorSuggestions } = require('./services/TripWell/anchorgptService');
const fs = require('fs');

// Test configurations for different Paris traveler profiles
const testProfiles = [
  {
    name: "Paris Budget Backpacker",
    tripData: {
      city: "Paris",
      season: "Spring",
      purpose: "Explore culture on a tight budget",
      whoWith: "solo"
    },
    tripIntentData: {
      priorities: ["Culture & History", "Food & Dining"],
      vibes: ["Authentic & Local"],
      mobility: ["Love walking everywhere"],
      travelPace: ["Slow & Relaxed - Take your time"],
      budget: "$30-50/day"
    }
  },
  {
    name: "Paris Luxury Romantic",
    tripData: {
      city: "Paris", 
      season: "Summer",
      purpose: "Romantic anniversary celebration",
      whoWith: "spouse"
    },
    tripIntentData: {
      priorities: ["Food & Dining", "Relaxation & Wellness"],
      vibes: ["Romantic & Intimate", "Luxurious & Upscale"],
      mobility: ["Prefer transport options"],
      travelPace: ["Moderate - Balanced activities"],
      budget: "$800-1200/day"
    }
  },
  {
    name: "Paris Family Educational",
    tripData: {
      city: "Paris",
      season: "Fall", 
      purpose: "Educational family vacation with kids",
      whoWith: "spouse-kids"
    },
    tripIntentData: {
      priorities: ["Culture & History", "Adventure & Outdoor"],
      vibes: ["Social & Fun"],
      mobility: ["Mix of walking and transport"],
      travelPace: ["Moderate - Balanced activities"],
      budget: "$200-350/day"
    }
  },
  {
    name: "Paris Adventure Seeker",
    tripData: {
      city: "Paris",
      season: "Summer",
      purpose: "Adventure and outdoor activities",
      whoWith: "friends"
    },
    tripIntentData: {
      priorities: ["Adventure & Outdoor", "Nightlife & Fun"],
      vibes: ["Adventurous & Active", "Social & Fun"],
      mobility: ["Love walking everywhere"],
      travelPace: ["Fast Paced - Pack it all in"],
      budget: "$150-250/day"
    }
  },
  {
    name: "Paris Foodie Explorer",
    tripData: {
      city: "Paris",
      season: "Spring",
      purpose: "Culinary journey and food experiences",
      whoWith: "friends"
    },
    tripIntentData: {
      priorities: ["Food & Dining", "Culture & History"],
      vibes: ["Authentic & Local", "Luxurious & Upscale"],
      mobility: ["Mix of walking and transport"],
      travelPace: ["Slow & Relaxed - Take your time"],
      budget: "$300-500/day"
    }
  },
  {
    name: "Paris Solo Cultural",
    tripData: {
      city: "Paris",
      season: "Winter",
      purpose: "Deep cultural immersion and art exploration",
      whoWith: "solo"
    },
    tripIntentData: {
      priorities: ["Culture & History", "Relaxation & Wellness"],
      vibes: ["Authentic & Local", "Relaxed & Chill"],
      mobility: ["Love walking everywhere"],
      travelPace: ["Flexible - Go with the flow"],
      budget: "$100-180/day"
    }
  },
  {
    name: "Paris Business Traveler",
    tripData: {
      city: "Paris",
      season: "Fall",
      purpose: "Business trip with leisure time",
      whoWith: "solo"
    },
    tripIntentData: {
      priorities: ["Relaxation & Wellness", "Food & Dining"],
      vibes: ["Luxurious & Upscale", "Relaxed & Chill"],
      mobility: ["Prefer transport options"],
      travelPace: ["Moderate - Balanced activities"],
      budget: "$400-600/day"
    }
  },
  {
    name: "Paris Shopping Enthusiast",
    tripData: {
      city: "Paris",
      season: "Summer",
      purpose: "Shopping and fashion exploration",
      whoWith: "friends"
    },
    tripIntentData: {
      priorities: ["Shopping & Markets", "Food & Dining"],
      vibes: ["Luxurious & Upscale", "Social & Fun"],
      mobility: ["Prefer transport options"],
      travelPace: ["Fast Paced - Pack it all in"],
      budget: "$500-800/day"
    }
  },
  {
    name: "Paris Nightlife Explorer",
    tripData: {
      city: "Paris",
      season: "Summer",
      purpose: "Nightlife and entertainment focus",
      whoWith: "friends"
    },
    tripIntentData: {
      priorities: ["Nightlife & Fun", "Food & Dining"],
      vibes: ["Social & Fun", "Adventurous & Active"],
      mobility: ["Prefer transport options"],
      travelPace: ["Fast Paced - Pack it all in"],
      budget: "$200-400/day"
    }
  },
  {
    name: "Paris Wellness Retreat",
    tripData: {
      city: "Paris",
      season: "Spring",
      purpose: "Wellness and relaxation focused trip",
      whoWith: "spouse"
    },
    tripIntentData: {
      priorities: ["Relaxation & Wellness", "Food & Dining"],
      vibes: ["Relaxed & Chill", "Romantic & Intimate"],
      mobility: ["Mix of walking and transport"],
      travelPace: ["Slow & Relaxed - Take your time"],
      budget: "$600-900/day"
    }
  }
];

async function runComprehensiveAngelaTests() {
  console.log("🧪 Starting Comprehensive Angela Paris Test Suite...\n");
  console.log(`📊 Testing ${testProfiles.length} different user profiles\n`);

  const results = [];
  const startTime = Date.now();

  for (let i = 0; i < testProfiles.length; i++) {
    const profile = testProfiles[i];
    console.log(`\n=== TEST ${i + 1}/10: ${profile.name} ===`);
    
    try {
      const testResult = await generateAnchorSuggestions({
        tripId: `test_${i + 1}`,
        userId: `test_${i + 1}`,
        tripData: profile.tripData,
        tripIntentData: profile.tripIntentData
      });

      const result = {
        testNumber: i + 1,
        profileName: profile.name,
        inputData: {
          tripData: profile.tripData,
          tripIntentData: profile.tripIntentData
        },
        outputAnchors: testResult.anchors,
        timestamp: new Date().toISOString(),
        success: true
      };

      results.push(result);
      console.log(`✅ ${profile.name} - Generated ${testResult.anchors.length} anchors`);
      
      // Show first anchor as preview
      if (testResult.anchors.length > 0) {
        console.log(`   Preview: "${testResult.anchors[0].title}"`);
      }

    } catch (error) {
      console.error(`❌ ${profile.name} - Failed:`, error.message);
      results.push({
        testNumber: i + 1,
        profileName: profile.name,
        inputData: {
          tripData: profile.tripData,
          tripIntentData: profile.tripIntentData
        },
        error: error.message,
        timestamp: new Date().toISOString(),
        success: false
      });
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  console.log(`\n🎯 Test Suite Complete!`);
  console.log(`⏱️  Total Duration: ${duration.toFixed(2)} seconds`);
  console.log(`✅ Successful Tests: ${results.filter(r => r.success).length}/${results.length}`);

  // Save results to file for Python analysis
  const outputFile = `angela-paris-test-results-${new Date().toISOString().split('T')[0]}.json`;
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  console.log(`📁 Results saved to: ${outputFile}`);

  // Generate summary for immediate review
  console.log(`\n📊 QUICK SUMMARY:`);
  results.forEach(result => {
    if (result.success) {
      console.log(`${result.testNumber}. ${result.profileName}: ${result.outputAnchors.length} anchors`);
    } else {
      console.log(`${result.testNumber}. ${result.profileName}: FAILED - ${result.error}`);
    }
  });

  return results;
}

// Run the tests
runComprehensiveAngelaTests().catch(console.error);
