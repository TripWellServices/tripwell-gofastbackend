// services/TripWell/modularCascadeService.js

const mongoose = require('mongoose');
const TripBase = require('../../models/TripWell/TripBase');
const TripPersona = require('../../models/TripWell/TripPersona');
// TripItinerary and AnchorLogic models removed - using ItineraryDays and TripCurrentDays
const ItineraryDays = require('../../models/TripWell/ItineraryDays');
const TripCurrentDays = require('../../models/TripWell/TripCurrentDays');
const TripReflection = require('../../models/TripWell/TripReflection');
const JoinCode = require('../../models/TripWell/JoinCode');
const UserSelections = require('../../models/TripWell/UserSelections');
const CityStuffToDo = require('../../models/TripWell/CityStuffToDo');
const SampleSelects = require('../../models/TripWell/SampleSelects');
const TripWellUser = require('../../models/TripWell/TripWellUser');

/**
 * Modular cascade deletion service
 * Handles user deletion with proper error handling and logging
 */

/**
 * Delete a user and all associated data (modular cascade deletion)
 * @param {string} userId - The user ID to delete
 * @param {object} session - MongoDB session for transaction
 * @returns {Object} - Deletion results
 */
async function deleteUserWithCascade(userId, session = null) {
  try {
    console.log(`🗑️ Starting modular cascade deletion for user: ${userId}`);
    
    const results = {
      success: true,
      userId,
      tripsDeleted: 0,
      totalRecordsDeleted: 0,
      deletedCollections: {},
      errors: []
    };

    // Find the user and their tripId
    const user = await TripWellUser.findById(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    
    if (!user.tripId) {
      console.log(`✅ User ${userId} has no tripId, deleting user only`);
      // Delete user without trip data
      await TripWellUser.findByIdAndDelete(userId, { session });
      results.totalRecordsDeleted = 1;
      results.deletedCollections.user = 1;
      return results;
    }
    
    const tripId = user.tripId.toString();
    console.log(`🔍 Found tripId for user: ${tripId}`);
    
    // Delete all trip-related data
    const tripDeletionResult = await deleteTripDataCascade(tripId, session);
    results.tripsDeleted = 1;
    results.totalRecordsDeleted += tripDeletionResult.totalDeleted;
    results.deletedCollections = { ...results.deletedCollections, ...tripDeletionResult.deletedCollections };
    
    // Delete user-specific data
    const userDeletionResult = await deleteUserDataCascade(userId, session);
    results.totalRecordsDeleted += userDeletionResult.totalDeleted;
    results.deletedCollections = { ...results.deletedCollections, ...userDeletionResult.deletedCollections };
    
    // Finally delete the user
    await TripWellUser.findByIdAndDelete(userId, { session });
    results.totalRecordsDeleted += 1;
    results.deletedCollections.user = 1;
    
    console.log(`✅ Modular cascade deletion complete for user ${userId}:`, {
      tripsDeleted: results.tripsDeleted,
      totalRecordsDeleted: results.totalRecordsDeleted,
      deletedCollections: results.deletedCollections
    });
    
    return results;
    
  } catch (error) {
    console.error(`❌ Modular cascade deletion failed for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Delete all trip-related data
 * @param {string} tripId - The trip ID to delete
 * @param {object} session - MongoDB session for transaction
 * @returns {Object} - Deletion results
 */
async function deleteTripDataCascade(tripId, session = null) {
  const deleteOptions = session ? { session } : {};
  const results = {
    totalDeleted: 0,
    deletedCollections: {}
  };
  
  try {
    console.log(`🗑️ Deleting trip data for tripId: ${tripId}`);
    
    // Delete JoinCode registry entry
    const deletedJoinCodes = await JoinCode.deleteMany({ tripId }, deleteOptions);
    results.totalDeleted += deletedJoinCodes.deletedCount;
    results.deletedCollections.joinCodes = deletedJoinCodes.deletedCount;
    console.log(`🗑️ Deleted ${deletedJoinCodes.deletedCount} JoinCode entries`);
    
    // Delete TripPersona
    const deletedTripPersonas = await TripPersona.deleteMany({ tripId }, deleteOptions);
    results.totalDeleted += deletedTripPersonas.deletedCount;
    results.deletedCollections.tripPersonas = deletedTripPersonas.deletedCount;
    console.log(`🗑️ Deleted ${deletedTripPersonas.deletedCount} TripPersonas`);
    
    // TripItinerary model removed - no longer needed
    console.log(`🗑️ TripItinerary model removed - skipping deletion`);
    
    // Delete ItineraryDays (planning phase)
    const deletedItineraryDays = await ItineraryDays.deleteMany({ tripId }, deleteOptions);
    results.totalDeleted += deletedItineraryDays.deletedCount;
    results.deletedCollections.itineraryDays = deletedItineraryDays.deletedCount;
    console.log(`🗑️ Deleted ${deletedItineraryDays.deletedCount} ItineraryDays`);
    
    // Delete TripCurrentDays (live execution phase)
    const deletedTripCurrentDays = await TripCurrentDays.deleteMany({ tripId }, deleteOptions);
    results.totalDeleted += deletedTripCurrentDays.deletedCount;
    results.deletedCollections.tripCurrentDays = deletedTripCurrentDays.deletedCount;
    console.log(`🗑️ Deleted ${deletedTripCurrentDays.deletedCount} TripCurrentDays`);
    
    // AnchorLogic model removed - no longer needed
    console.log(`🗑️ AnchorLogic model removed - skipping deletion`);
    
    // Delete TripReflection
    const deletedTripReflections = await TripReflection.deleteMany({ tripId }, deleteOptions);
    results.totalDeleted += deletedTripReflections.deletedCount;
    results.deletedCollections.tripReflections = deletedTripReflections.deletedCount;
    console.log(`🗑️ Deleted ${deletedTripReflections.deletedCount} TripReflections`);
    
    // Finally delete the TripBase
    const deletedTripBase = await TripBase.findByIdAndDelete(tripId, deleteOptions);
    results.totalDeleted += deletedTripBase ? 1 : 0;
    results.deletedCollections.tripBase = deletedTripBase ? 1 : 0;
    console.log(`🗑️ Deleted TripBase: ${deletedTripBase?.tripName || 'Unknown'}`);
    
    console.log(`✅ Trip data deletion complete: ${results.totalDeleted} total records`);
    return results;
    
  } catch (error) {
    console.error(`❌ Trip data deletion failed for tripId ${tripId}:`, error);
    throw error;
  }
}

/**
 * Delete user-specific data
 * @param {string} userId - The user ID to delete
 * @param {object} session - MongoDB session for transaction
 * @returns {Object} - Deletion results
 */
async function deleteUserDataCascade(userId, session = null) {
  const deleteOptions = session ? { session } : {};
  const results = {
    totalDeleted: 0,
    deletedCollections: {}
  };
  
  try {
    console.log(`🗑️ Deleting user-specific data for userId: ${userId}`);
    
    // Delete UserSelections
    const deletedUserSelections = await UserSelections.deleteMany({ userId }, deleteOptions);
    results.totalDeleted += deletedUserSelections.deletedCount;
    results.deletedCollections.userSelections = deletedUserSelections.deletedCount;
    console.log(`🗑️ Deleted ${deletedUserSelections.deletedCount} UserSelections`);
    
    // Delete SampleSelects
    const deletedSampleSelects = await SampleSelects.deleteMany({ userId }, deleteOptions);
    results.totalDeleted += deletedSampleSelects.deletedCount;
    results.deletedCollections.sampleSelects = deletedSampleSelects.deletedCount;
    console.log(`🗑️ Deleted ${deletedSampleSelects.deletedCount} SampleSelects`);
    
    console.log(`✅ User data deletion complete: ${results.totalDeleted} total records`);
    return results;
    
  } catch (error) {
    console.error(`❌ User data deletion failed for userId ${userId}:`, error);
    throw error;
  }
}

module.exports = {
  deleteUserWithCascade,
  deleteTripDataCascade,
  deleteUserDataCascade
};
