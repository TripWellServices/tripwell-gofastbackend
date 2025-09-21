const TripWellUser = require("../../models/TripWellUser");
const TripBase = require("../../models/TripWell/TripBase");
const TripPersona = require("../../models/TripWell/TripPersona");
const City = require("../../models/TripWell/City");
const MetaAttractions = require("../../models/TripWell/MetaAttractions");
const UserSelections = require("../../models/TripWell/UserSelections");
const TripItinerary = require("../../models/TripWell/TripItinerary");

class UserResetService {
  /**
   * Reset user to new user state (cascade delete)
   * @param {string} userId - MongoDB ObjectId of user to reset
   * @returns {Object} - Reset results
   */
  async resetUserToNew(userId) {
    try {
      console.log(`🔄 Starting cascade reset for user: ${userId}`);
      
      const results = {
        userReset: false,
        tripsDeleted: 0,
        personasDeleted: 0,
        selectionsDeleted: 0,
        itinerariesDeleted: 0,
        errors: []
      };

      // 1. Find user first
      const user = await TripWellUser.findById(userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      // 2. Get all trips for this user
      const userTrips = await TripBase.find({ 
        $or: [
          { originatorId: userId },
          { participantIds: userId }
        ]
      });

      console.log(`🔍 Found ${userTrips.length} trips for user`);

      // 3. Delete all related data (cascade)
      for (const trip of userTrips) {
        try {
          // Delete trip personas
          const personasDeleted = await TripPersona.deleteMany({ tripId: trip._id });
          results.personasDeleted += personasDeleted.deletedCount;

          // Delete user selections
          const selectionsDeleted = await UserSelections.deleteMany({ tripId: trip._id });
          results.selectionsDeleted += selectionsDeleted.deletedCount;

            // Delete itineraries
            const itinerariesDeleted = await TripItinerary.deleteMany({ tripId: trip._id });
          results.itinerariesDeleted += itinerariesDeleted.deletedCount;

          console.log(`🗑️ Deleted data for trip ${trip._id}: ${personasDeleted.deletedCount} personas, ${selectionsDeleted.deletedCount} selections, ${itinerariesDeleted.deletedCount} itineraries`);
        } catch (tripError) {
          console.error(`❌ Error deleting data for trip ${trip._id}:`, tripError);
          results.errors.push(`Trip ${trip._id}: ${tripError.message}`);
        }
      }

      // 4. Delete all trips
      const tripsDeleted = await TripBase.deleteMany({ 
        $or: [
          { originatorId: userId },
          { participantIds: userId }
        ]
      });
      results.tripsDeleted = tripsDeleted.deletedCount;

      // 5. Reset user to new user state
      const userReset = await TripWellUser.findByIdAndUpdate(
        userId,
        {
          $set: {
            // Reset profile fields
            firstName: "",
            lastName: "",
            hometownCity: "",
            homeState: "",
            persona: "",
            planningStyle: "",
            dreamDestination: "",
            profileComplete: false,
            
            // Reset persona scores
            personaScore: 0.1,
            planningFlex: 0.5,
            
            // Reset journey state
            journeyStage: "new_user",
            userStatus: "signup",
            
            // Reset trip data
            tripId: null,
            role: "noroleset",
            
            // Reset funnel stage
            funnelStage: "none",
            
            // Reset analysis data
            lastAnalyzedAt: null,
            lastMarketingEmail: {
              sentAt: null,
              campaign: null,
              status: null
            }
          }
        },
        { new: true }
      );

      if (userReset) {
        results.userReset = true;
        console.log(`✅ User ${userId} reset to new user state`);
      }

      console.log(`🎯 Reset complete for user ${userId}:`, results);
      return results;

    } catch (error) {
      console.error(`❌ Error resetting user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Reset user to specific journey stage
   * @param {string} userId - MongoDB ObjectId of user
   * @param {string} journeyStage - Target journey stage
   * @param {string} userStatus - Target user status
   * @returns {Object} - Reset results
   */
  async resetUserToStage(userId, journeyStage, userStatus) {
    try {
      console.log(`🔄 Resetting user ${userId} to stage: ${journeyStage}, status: ${userStatus}`);
      
      const user = await TripWellUser.findByIdAndUpdate(
        userId,
        {
          $set: {
            journeyStage,
            userStatus,
            lastAnalyzedAt: null
          }
        },
        { new: true }
      );

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      console.log(`✅ User ${userId} reset to ${journeyStage}/${userStatus}`);
      return { success: true, user };

    } catch (error) {
      console.error(`❌ Error resetting user ${userId} to stage:`, error);
      throw error;
    }
  }

  /**
   * Get user reset options
   * @returns {Array} - Available reset options
   */
  getResetOptions() {
    return [
      {
        label: "New User (Complete Reset)",
        journeyStage: "new_user",
        userStatus: "signup",
        description: "Reset to brand new user - deletes all trips and data"
      },
      {
        label: "Profile Complete",
        journeyStage: "profile_complete", 
        userStatus: "active",
        description: "User has completed profile setup"
      },
      {
        label: "Trip Set Done",
        journeyStage: "trip_set_done",
        userStatus: "active", 
        description: "User has created a trip"
      },
      {
        label: "Itinerary Complete",
        journeyStage: "itinerary_complete",
        userStatus: "active",
        description: "User has generated itinerary"
      }
    ];
  }
}

module.exports = new UserResetService();
