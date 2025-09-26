const mongoose = require('mongoose');
require('dotenv').config();

// Import the TripWellUser model
const TripWellUser = require('../models/TripWell/TripWellUser');

async function fixProfileComplete() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "GoFastFamily",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Find users who have profile data but profileComplete is not set to true
    const usersToUpdate = await TripWellUser.find({
      $and: [
        { firstName: { $exists: true, $ne: "" } },
        { lastName: { $exists: true, $ne: "" } },
        { 
          $or: [
            { profileComplete: { $exists: false } },
            { profileComplete: false },
            { profileComplete: null }
          ]
        }
      ]
    });

    console.log(`🔍 Found ${usersToUpdate.length} users to update`);

    if (usersToUpdate.length === 0) {
      console.log("✅ No users need updating");
      return;
    }

    // Update each user
    for (const user of usersToUpdate) {
      console.log(`👤 Updating user: ${user.email} (${user.firstName} ${user.lastName})`);
      
      await TripWellUser.findByIdAndUpdate(user._id, {
        profileComplete: true
      });
      
      console.log(`✅ Updated ${user.email}`);
    }

    console.log(`🎉 Successfully updated ${usersToUpdate.length} users`);

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the script
fixProfileComplete();
