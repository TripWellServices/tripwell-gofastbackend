// services/TripWell/cascadeDeletionService.js

const mongoose = require('mongoose');
const TripBase = require('../../models/TripWell/TripBase');
const JoinCode = require('../../models/TripWell/JoinCode');
const TripPersona = require('../../models/TripWell/TripPersona');
const TripItinerary = require('../../models/TripWell/TripItinerary');
const TripDay = require('../../models/TripWell/TripDay');
const AnchorLogic = require('../../models/TripWell/AnchorLogic');
const TripReflection = require('../../models/TripWell/TripReflection');

// Ensure we're using the correct database connection (same as TripBase)
const db = mongoose.connection.useDb('GoFastFamily');
console.log('🔍 DEBUG: Using database:', db.databaseName);

/**
 * Delete a trip and all associated data (cascade deletion)
 * @param {string} tripId - The trip ID to delete
 * @param {object} session - MongoDB session for transaction
 */
async function deleteTripCascade(tripId, session = null) {
  try {
    console.log(`🗑️ Starting cascade deletion for trip: ${tripId}`);
    
    const deleteOptions = session ? { session } : {};
    
    // 1. Delete JoinCode registry entry
    const deletedJoinCodes = await JoinCode.deleteMany({ tripId }, deleteOptions);
    console.log(`🗑️ Deleted ${deletedJoinCodes.deletedCount} JoinCode entries for trip ${tripId}`);
    
    // 2. Delete TripPersona
    const deletedTripPersonas = await TripPersona.deleteMany({ tripId }, deleteOptions);
    console.log(`🗑️ Deleted ${deletedTripPersonas.deletedCount} TripPersonas for trip ${tripId}`);
    
    // 3. Delete TripItinerary
    const deletedTripItineraries = await TripItinerary.deleteMany({ tripId }, deleteOptions);
    console.log(`🗑️ Deleted ${deletedTripItineraries.deletedCount} TripItineraries for trip ${tripId}`);
    
    // 4. Delete TripDay
    const deletedTripDays = await TripDay.deleteMany({ tripId }, deleteOptions);
    console.log(`🗑️ Deleted ${deletedTripDays.deletedCount} TripDays for trip ${tripId}`);
    
    // 5. Delete AnchorLogic
    const deletedAnchorLogic = await AnchorLogic.deleteMany({ tripId }, deleteOptions);
    console.log(`🗑️ Deleted ${deletedAnchorLogic.deletedCount} AnchorLogic entries for trip ${tripId}`);
    
    // 6. Delete TripReflection
    const deletedTripReflections = await TripReflection.deleteMany({ tripId }, deleteOptions);
    console.log(`🗑️ Deleted ${deletedTripReflections.deletedCount} TripReflections for trip ${tripId}`);
    
    // 7. Finally delete the TripBase
    const deletedTripBase = await TripBase.findByIdAndDelete(tripId, deleteOptions);
    console.log(`🗑️ Deleted TripBase: ${deletedTripBase?.tripName || 'Unknown'} (${tripId})`);
    
    const totalDeleted = deletedJoinCodes.deletedCount + 
                        deletedTripPersonas.deletedCount + 
                        deletedTripItineraries.deletedCount + 
                        deletedTripDays.deletedCount + 
                        deletedAnchorLogic.deletedCount + 
                        deletedTripReflections.deletedCount + 
                        (deletedTripBase ? 1 : 0);
    
    console.log(`✅ Cascade deletion complete for trip ${tripId}. Total records deleted: ${totalDeleted}`);
    
    return {
      success: true,
      tripId,
      deletedCounts: {
        joinCodes: deletedJoinCodes.deletedCount,
        tripPersonas: deletedTripPersonas.deletedCount,
        tripItineraries: deletedTripItineraries.deletedCount,
        tripDays: deletedTripDays.deletedCount,
        anchorLogic: deletedAnchorLogic.deletedCount,
        tripReflections: deletedTripReflections.deletedCount,
        tripBase: deletedTripBase ? 1 : 0
      },
      totalDeleted
    };
    
  } catch (error) {
    console.error(`❌ Cascade deletion failed for trip ${tripId}:`, error);
    throw error;
  }
}

/**
 * Delete all trips for a user (cascade deletion)
 * @param {string} userId - The user ID whose trips to delete
 * @param {object} session - MongoDB session for transaction
 */
async function deleteUserTripsCascade(userId, session = null) {
  try {
    console.log(`🗑️ Starting cascade deletion for all trips by user: ${userId}`);
    
    // Find the user and their tripId
    const TripWellUser = require('../../models/TripWell/TripWellUser');
    const user = await TripWellUser.findById(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    
    if (!user.tripId) {
      console.log(`✅ User ${userId} has no tripId, nothing to delete`);
      return { success: true, tripsDeleted: 0, totalRecordsDeleted: 0 };
    }
    
    const userTrips = [{ tripId: user.tripId }];
    
    console.log(`🔍 Found ${userTrips.length} trips by user ${userId}`);
    
    if (userTrips.length === 0) {
      return { success: true, tripsDeleted: 0, totalRecordsDeleted: 0 };
    }
    
    let totalRecordsDeleted = 0;
    const deletedTrips = [];
    
    // Delete the trip with cascade
    const result = await deleteTripCascade(userTrips[0].tripId.toString(), session);
    totalRecordsDeleted += result.totalDeleted;
    deletedTrips.push({
      tripId: userTrips[0].tripId,
      tripName: "User's trip",
      joinCode: "N/A"
    });
    
    console.log(`✅ Cascade deletion complete for user ${userId}. Deleted ${deletedTrips.length} trips and ${totalRecordsDeleted} total records`);
    
    return {
      success: true,
      userId,
      tripsDeleted: deletedTrips.length,
      totalRecordsDeleted,
      deletedTrips
    };
    
  } catch (error) {
    console.error(`❌ User trips cascade deletion failed for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Delete orphaned data (data without valid users or trips)
 * @param {object} session - MongoDB session for transaction
 */
async function deleteOrphanedDataCascade(session = null) {
  try {
    console.log(`🗑️ Starting orphaned data cascade deletion...`);
    
    const deleteOptions = session ? { session } : {};
    
    // Get all existing user IDs
    const TripWellUser = require('../../models/TripWell/TripWellUser');
    const existingUsers = await TripWellUser.find({}, '_id');
    const existingUserIds = existingUsers.map(user => user._id.toString());
    console.log(`📊 Found ${existingUserIds.length} existing users`);
    
    // Get all existing trip IDs
    const existingTrips = await TripBase.find({}, '_id');
    const existingTripIds = existingTrips.map(trip => trip._id.toString());
    console.log(`📊 Found ${existingTripIds.length} existing trips`);
    
    let totalDeleted = 0;
    
    // Delete orphaned JoinCodes
    const orphanedJoinCodes = await JoinCode.deleteMany({
      $or: [
        { userId: { $nin: existingUserIds } },
        { tripId: { $nin: existingTripIds } }
      ]
    }, deleteOptions);
    totalDeleted += orphanedJoinCodes.deletedCount;
    console.log(`🗑️ Deleted ${orphanedJoinCodes.deletedCount} orphaned JoinCodes`);
    
    // Delete orphaned TripPersonas
    const orphanedTripPersonas = await TripPersona.deleteMany({
      userId: { $nin: existingUserIds }
    }, deleteOptions);
    totalDeleted += orphanedTripPersonas.deletedCount;
    console.log(`🗑️ Deleted ${orphanedTripPersonas.deletedCount} orphaned TripPersonas`);
    
    // Delete orphaned TripItineraries
    const orphanedTripItineraries = await TripItinerary.deleteMany({
      tripId: { $nin: existingTripIds }
    }, deleteOptions);
    totalDeleted += orphanedTripItineraries.deletedCount;
    console.log(`🗑️ Deleted ${orphanedTripItineraries.deletedCount} orphaned TripItineraries`);
    
    // Delete orphaned TripDays
    const orphanedTripDays = await TripDay.deleteMany({
      tripId: { $nin: existingTripIds }
    }, deleteOptions);
    totalDeleted += orphanedTripDays.deletedCount;
    console.log(`🗑️ Deleted ${orphanedTripDays.deletedCount} orphaned TripDays`);
    
    // Delete orphaned AnchorLogic
    const orphanedAnchorLogic = await AnchorLogic.deleteMany({
      tripId: { $nin: existingTripIds }
    }, deleteOptions);
    totalDeleted += orphanedAnchorLogic.deletedCount;
    console.log(`🗑️ Deleted ${orphanedAnchorLogic.deletedCount} orphaned AnchorLogic`);
    
    // Delete orphaned TripReflections
    const orphanedTripReflections = await TripReflection.deleteMany({
      tripId: { $nin: existingTripIds }
    }, deleteOptions);
    totalDeleted += orphanedTripReflections.deletedCount;
    console.log(`🗑️ Deleted ${orphanedTripReflections.deletedCount} orphaned TripReflections`);
    
    // Delete orphaned TripBases (trips without valid originators)
    const orphanedTripBases = await TripBase.deleteMany({
      _id: { $nin: existingTripIds }
    }, deleteOptions);
    totalDeleted += orphanedTripBases.deletedCount;
    console.log(`🗑️ Deleted ${orphanedTripBases.deletedCount} orphaned TripBases`);
    
    console.log(`✅ Orphaned data cascade deletion complete. Total records deleted: ${totalDeleted}`);
    
    return {
      success: true,
      totalDeleted,
      deletedCounts: {
        joinCodes: orphanedJoinCodes.deletedCount,
        tripPersonas: orphanedTripPersonas.deletedCount,
        tripItineraries: orphanedTripItineraries.deletedCount,
        tripDays: orphanedTripDays.deletedCount,
        anchorLogic: orphanedAnchorLogic.deletedCount,
        tripReflections: orphanedTripReflections.deletedCount,
        tripBases: orphanedTripBases.deletedCount
      }
    };
    
  } catch (error) {
    console.error(`❌ Orphaned data cascade deletion failed:`, error);
    throw error;
  }
}

/**
 * Unified cascade deletion - handles both user and trip deletion
 * @param {string} userId - The user ID (optional)
 * @param {string} tripId - The trip ID (optional)
 * @param {object} session - MongoDB session for transaction
 */
async function cascadeDelete(userId = null, tripId = null, session = null) {
  try {
    if (!userId && !tripId) {
      throw new Error('Either userId or tripId must be provided');
    }
    
    if (userId && tripId) {
      throw new Error('Cannot delete both user and trip in same call - use separate calls');
    }
    
    if (userId) {
      console.log(`🗑️ Unified cascade deletion for USER: ${userId}`);
      return await deleteUserTripsCascade(userId, session);
    }
    
    if (tripId) {
      console.log(`🗑️ Unified cascade deletion for TRIP: ${tripId}`);
      return await deleteTripCascade(tripId, session);
    }
    
  } catch (error) {
    console.error(`❌ Unified cascade deletion failed:`, error);
    throw error;
  }
}

module.exports = {
  deleteTripCascade,
  deleteUserTripsCascade,
  deleteOrphanedDataCascade,
  cascadeDelete // 🎯 UNIFIED CASCADE DELETION
};
