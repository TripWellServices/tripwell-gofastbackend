// services/TripWell/joinCodePushService.js

const JoinCode = require("../../models/TripWell/JoinCode");
const TripBase = require("../../models/TripWell/TripBase");

/**
 * Push trip data to JoinCode registry after TripBase saves
 * @param {string} tripId - The TripBase _id
 * @param {string} userId - The TripWellUser _id  
 * @param {string} joinCode - The join code from TripBase
 */
async function pushToJoinCodeRegistry(tripId, userId, joinCode) {
  try {
    // Validate inputs
    if (!tripId || !userId || !joinCode) {
      throw new Error("Missing required parameters: tripId, userId, joinCode");
    }

    // Verify the trip exists
    const trip = await TripBase.findById(tripId);
    if (!trip) {
      throw new Error(`Trip not found with id: ${tripId}`);
    }

    // Check if join code is already in registry
    const existing = await JoinCode.findOne({ joinCode });
    if (existing) {
      throw new Error(`Join code '${joinCode}' already exists in registry`);
    }

    // Create registry entry
    const registryEntry = await JoinCode.create({
      joinCode,
      tripId,
      userId,
      createdAt: new Date()
    });

    console.log("✅ Pushed to JoinCode registry:", {
      joinCode,
      tripId: tripId.toString(),
      userId: userId.toString()
    });

    return registryEntry;
  } catch (err) {
    console.error("❌ Failed to push to JoinCode registry:", err);
    throw err;
  }
}

/**
 * Push trip data to registry using tripId (fetches other data)
 * @param {string} tripId - The TripBase _id
 * @param {string} userId - The TripWellUser _id
 */
async function pushTripToRegistry(tripId, userId) {
  try {
    // Get trip data
    const trip = await TripBase.findById(tripId);
    if (!trip) {
      throw new Error(`Trip not found: ${tripId}`);
    }

    if (!trip.joinCode) {
      throw new Error(`Trip ${tripId} has no join code`);
    }

    // Push to registry
    return await pushToJoinCodeRegistry(tripId, userId, trip.joinCode);
  } catch (err) {
    console.error("❌ Failed to push trip to registry:", err);
    throw err;
  }
}

module.exports = {
  pushToJoinCodeRegistry,
  pushTripToRegistry
};
