require('dotenv').config();
const mongoose = require('mongoose');

// Connect to database first
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/GoFastFamily');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

const { generateItineraryFromMetaLogic } = require('./services/TripWell/itineraryGPTService');

async function testItineraryGPT() {
  console.log('🧪 Testing itineraryGPTService with sample data...');
  
  try {
    // Sample data
    const tripId = '507f1f77bcf86cd799439011'; // Sample ObjectId
    const userId = 'test-user-123';
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

    console.log('📊 Sample data:');
    console.log('- TripId:', tripId);
    console.log('- UserId:', userId);
    console.log('- Selected Metas:', selectedMetas.length);
    console.log('- Selected Samples:', selectedSamples.length);

    const result = await generateItineraryFromMetaLogic(tripId, userId, selectedMetas, selectedSamples);
    
    console.log('✅ Success!');
    console.log('📅 Generated days:', result.daysSaved);
    console.log('🎯 Result:', result);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

async function main() {
  await connectDB();
  await testItineraryGPT();
}

main();
