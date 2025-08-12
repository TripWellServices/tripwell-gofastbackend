// scripts/flushAdamTripId.js
// Targeted script to flush Adam's tripId only

const mongoose = require('mongoose');
const TripWellUser = require('../models/TripWellUser');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gofast';

// Adam's Firebase ID
const ADAM_FIREBASE_ID = "5m5XpT4J6Qf8B2tMUawHBKbvKbA2";

async function flushAdamTripId() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🔍 Finding Adam\'s user record...');
    const adamUser = await TripWellUser.findOne({ firebaseId: ADAM_FIREBASE_ID });
    
    if (!adamUser) {
      console.log('❌ Adam\'s user record not found');
      return;
    }

    console.log('📊 Adam\'s current record:', {
      email: adamUser.email,
      firstName: adamUser.firstName,
      lastName: adamUser.lastName,
      tripId: adamUser.tripId
    });

    if (!adamUser.tripId) {
      console.log('✅ Adam already has no tripId - nothing to flush');
      return;
    }

    console.log('🧹 Flushing Adam\'s tripId...');
    const result = await TripWellUser.updateOne(
      { firebaseId: ADAM_FIREBASE_ID },
      { $unset: { tripId: "" } }
    );

    if (result.modifiedCount === 1) {
      console.log('✅ Successfully flushed Adam\'s tripId');
    } else {
      console.log('⚠️ No changes made to Adam\'s record');
    }

    // Verify the flush
    const updatedAdam = await TripWellUser.findOne({ firebaseId: ADAM_FIREBASE_ID });
    console.log('🔍 Verification - Adam\'s tripId after flush:', updatedAdam.tripId);

    if (!updatedAdam.tripId) {
      console.log('🎉 SUCCESS: Adam\'s tripId has been flushed!');
    } else {
      console.log('❌ ERROR: Adam still has tripId');
    }

  } catch (error) {
    console.error('❌ Error flushing Adam\'s tripId:', error);
  } finally {
    console.log('🔌 Disconnecting from MongoDB...');
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  console.log('🚀 Starting Adam\'s tripId flush script...');
  flushAdamTripId()
    .then(() => {
      console.log('✅ Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = flushAdamTripId;
