// scripts/flushAdamTripId.js
// Targeted script to flush Adam's tripId and role

const mongoose = require('mongoose');
require('dotenv').config(); // Load .env
const TripWellUser = require('../models/TripWellUser'); // Correct path

const MONGO_URI = process.env.MONGO_URI;
const ADAM_FIREBASE_ID = "5m5XpT4J6Qf8B2tMUawHBKbvKbA2";

async function flushAdamTripIdAndRole() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    if (!MONGO_URI) throw new Error('❌ MONGO_URI environment variable not set');

    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    console.log('🔍 Finding Adam\'s user record...');
    const adamUser = await TripWellUser.findOne({ firebaseId: ADAM_FIREBASE_ID });

    if (!adamUser) {
      console.log('❌ Adam\'s user record not found');
      return;
    }

    console.log('📊 Current record:', {
      email: adamUser.email,
      firstName: adamUser.firstName,
      lastName: adamUser.lastName,
      tripId: adamUser.tripId,
      role: adamUser.role
    });

    if (!adamUser.tripId && !adamUser.role) {
      console.log('✅ Already has no tripId or role - nothing to flush');
      return;
    }

    console.log('🧹 Flushing tripId and role...');
    adamUser.tripId = null;
    adamUser.role = null;
    await adamUser.save();

    console.log('🎉 SUCCESS: Flushed tripId and role!');
    console.log('📊 Updated record:', {
      tripId: adamUser.tripId,
      role: adamUser.role
    });

  } catch (error) {
    console.error('❌ Error flushing:', error);
  } finally {
    console.log('🔌 Disconnecting from MongoDB...');
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

if (require.main === module) {
  console.log('🚀 Starting Adam\'s tripId & role flush script...');
  flushAdamTripIdAndRole()
    .then(() => {
      console.log('✅ Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = flushAdamTripIdAndRole;
