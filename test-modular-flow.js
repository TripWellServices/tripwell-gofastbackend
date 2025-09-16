const fetch = require('node-fetch');

// Test data - formatted for the backend route
const testData = {
  placeSlug: "TokyoLuxuryCouple",
  inputVariables: {
    city: "Tokyo",
    season: "Spring",
    whoWith: "Couple",
    budget: "Luxury",
    priorities: ["Culture", "Food"],
    vibes: ["Adventure", "Local"],
    mobility: ["Love walking everywhere"],
    travelPace: "Relaxed"
  }
};

async function testModularFlow() {
  console.log('🚀 Testing modular flow against Render backend...');
  console.log('📍 Backend URL: https://gofastbackend.onrender.com');
  console.log('📊 Test Data:', JSON.stringify(testData, null, 2));
  console.log('');

  try {
    // Step 1: Save place profile
    console.log('📋 Step 1: Saving place profile...');
    const profileResponse = await fetch('https://gofastbackend.onrender.com/tripwell/place-profile-save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('📊 Profile Response Status:', profileResponse.status);
    console.log('📊 Profile Response Headers:', Object.fromEntries(profileResponse.headers.entries()));

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.log('❌ Profile save failed:', errorText);
      return;
    }

    const profileResult = await profileResponse.json();
    console.log('✅ Profile saved successfully:', JSON.stringify(profileResult, null, 2));
    console.log('');

    // Step 2: Generate meta attractions
    console.log('📋 Step 2: Generating meta attractions...');
    const metaResponse = await fetch('https://gofastbackend.onrender.com/tripwell/meta-attractions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        placeSlug: testData.placeSlug,
        city: testData.inputVariables.city,
        season: testData.inputVariables.season
      }),
    });

    console.log('📊 Meta Response Status:', metaResponse.status);
    console.log('📊 Meta Response Headers:', Object.fromEntries(metaResponse.headers.entries()));

    if (!metaResponse.ok) {
      const errorText = await metaResponse.text();
      console.log('❌ Meta attractions failed:', errorText);
      return;
    }

    const metaResult = await metaResponse.json();
    console.log('✅ Meta attractions generated successfully:', JSON.stringify(metaResult, null, 2));
    console.log('');

    console.log('🎉 MODULAR FLOW TEST COMPLETE!');
    console.log('📊 Both routes worked successfully!');

  } catch (error) {
    console.error('❌ Error in modular flow test:', error.message);
    console.error('📊 Full error:', error);
  }
}

// Run the test
testModularFlow();
