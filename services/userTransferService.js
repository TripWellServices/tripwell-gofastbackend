// services/userTransferService.js - Transfer Firebase users to TripWellUser
const TripWellFirebaseOnly = require("../models/TripWellFirebaseOnly");
const TripWellUser = require("../models/TripWellUser");

/**
 * Transfer Firebase-only user to full TripWellUser
 * This runs as a background service to migrate users
 */
const transferFirebaseUserToTripWellUser = async (firebaseUser) => {
  try {
    console.log(`🔄 Transferring Firebase user: ${firebaseUser.email}`);
    
    // Create full TripWellUser from Firebase data
    const tripWellUser = new TripWellUser({
      firebaseId: firebaseUser.firebaseId,
      email: firebaseUser.email,
      firstName: null,        // Profile fields start empty
      lastName: null,
      hometownCity: null,
      homeState: null,
      travelStyle: [],
      tripVibe: [],
      userStatus: "signup",
      tripId: null,
      role: "noroleset",
      funnelStage: "none",
      journeyStage: "new_user"
    });

    await tripWellUser.save();
    
    // Mark Firebase user as transferred
    await TripWellFirebaseOnly.findByIdAndUpdate(firebaseUser._id, {
      transferredToTripWellUser: true,
      transferredAt: new Date()
    });

    console.log(`✅ Successfully transferred ${firebaseUser.email} to TripWellUser`);
    return tripWellUser;
    
  } catch (error) {
    console.error(`❌ Failed to transfer Firebase user: ${firebaseUser.email}`, error);
    throw error;
  }
};

/**
 * Get or create TripWellUser from Firebase data
 * This is the main function used by routes
 */
const getOrCreateTripWellUser = async (firebaseId, email) => {
  try {
    // First check if full TripWellUser exists
    let tripWellUser = await TripWellUser.findOne({ firebaseId });
    
    if (tripWellUser) {
      console.log(`✅ Found existing TripWellUser: ${email}`);
      return { user: tripWellUser, isNewUser: false };
    }

    // Check if Firebase-only user exists
    const firebaseUser = await TripWellFirebaseOnly.findOne({ firebaseId });
    
    if (firebaseUser && !firebaseUser.transferredToTripWellUser) {
      // DON'T transfer yet! Only transfer when profile is complete
      console.log(`⏳ Firebase user exists but not transferred yet: ${email}`);
      return { user: null, isNewUser: true, needsProfileSetup: true };
    }

    // Create new Firebase-only user (don't transfer yet!)
    console.log(`🆕 Creating new Firebase-only user: ${email}`);
    const newFirebaseUser = new TripWellFirebaseOnly({
      firebaseId,
      email
    });
    
    await newFirebaseUser.save();
    
    // DON'T transfer to TripWellUser until profile is complete!
    console.log(`⏳ Created Firebase user, waiting for profile completion: ${email}`);
    return { user: null, isNewUser: true, needsProfileSetup: true };
    
  } catch (error) {
    console.error(`❌ Error in getOrCreateTripWellUser: ${email}`, error);
    throw error;
  }
};

/**
 * Transfer Firebase user to TripWellUser when profile is complete
 * This should only be called AFTER profile setup
 */
const transferOnProfileComplete = async (firebaseId) => {
  try {
    const firebaseUser = await TripWellFirebaseOnly.findOne({ 
      firebaseId, 
      transferredToTripWellUser: false 
    });
    
    if (!firebaseUser) {
      console.log(`❌ No Firebase user found for transfer: ${firebaseId}`);
      return null;
    }
    
    console.log(`🔄 Transferring Firebase user on profile completion: ${firebaseUser.email}`);
    const tripWellUser = await transferFirebaseUserToTripWellUser(firebaseUser);
    
    return tripWellUser;
    
  } catch (error) {
    console.error(`❌ Error in transferOnProfileComplete: ${firebaseId}`, error);
    throw error;
  }
};

module.exports = {
  transferFirebaseUserToTripWellUser,
  getOrCreateTripWellUser,
  transferOnProfileComplete
};
