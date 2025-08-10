// services/TripWell/joinCodeRegistryService.js

const JoinCode = require("../../models/TripWell/JoinCode");

/**
 * Register a new join code in the registry
 */
async function registerJoinCode(joinCode, tripId, userId) {
  try {
    const registryEntry = await JoinCode.create({
      joinCode,
      tripId,
      userId
    });
    
    console.log("✅ Join code registered:", joinCode, "for trip:", tripId);
    return registryEntry;
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.joinCode) {
      throw new Error("Join code already exists in registry");
    }
    throw err;
  }
}

/**
 * Check if a join code is available (not in registry)
 */
async function isJoinCodeAvailable(joinCode) {
  try {
    const existing = await JoinCode.findOne({ joinCode });
    return !existing; // Available if not found
  } catch (err) {
    console.error("❌ Error checking join code availability:", err);
    throw err;
  }
}

/**
 * Find trip by join code
 */
async function findTripByJoinCode(joinCode) {
  try {
    const registryEntry = await JoinCode.findOne({ joinCode }).populate('tripId');
    return registryEntry?.tripId || null;
  } catch (err) {
    console.error("❌ Error finding trip by join code:", err);
    throw err;
  }
}

/**
 * Get all join codes for a user
 */
async function getUserJoinCodes(userId) {
  try {
    const entries = await JoinCode.find({ userId }).populate('tripId');
    return entries;
  } catch (err) {
    console.error("❌ Error getting user join codes:", err);
    throw err;
  }
}

/**
 * Remove a join code from registry (when trip is deleted)
 */
async function removeJoinCode(joinCode) {
  try {
    const result = await JoinCode.deleteOne({ joinCode });
    console.log("✅ Join code removed from registry:", joinCode);
    return result;
  } catch (err) {
    console.error("❌ Error removing join code:", err);
    throw err;
  }
}

module.exports = {
  registerJoinCode,
  isJoinCodeAvailable,
  findTripByJoinCode,
  getUserJoinCodes,
  removeJoinCode
};
