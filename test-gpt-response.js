const { generateMetaAttractions } = require("./services/TripWell/metaAttractionsService");

async function testGPTResponse() {
  console.log('🧪 Testing GPT response directly...');
  
  try {
    const result = await generateMetaAttractions({ 
      city: "London", 
      season: "Spring" 
    });
    
    console.log('📊 Raw GPT Response:');
    console.log('='.repeat(50));
    console.log(result.rawResponse);
    console.log('='.repeat(50));
    
    console.log('📊 Trying to parse JSON...');
    const parsed = JSON.parse(result.rawResponse);
    console.log('✅ JSON parsed successfully:', parsed.length, 'attractions');
    console.log('📊 First attraction:', parsed[0]);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testGPTResponse();
