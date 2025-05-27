// services/TripWell/userTripService.js

const User = require("../../models/User");

// ✅ Called after trip is created or joined
async function setUserTrip(firebaseId, tripId) {
  return await User.findOneAndUpdate(
    { firebaseId },
    { tripId }, // sets the active trip
    { new: true }
  );
}

// 💤 Optional: called when a trip is completed
async function archiveTrip(firebaseId, tripId) {
  return await User.findOneAndUpdate(
    { firebaseId },
    {
      tripId: null,
      pastTripId: tripId // store the most recently completed trip
    },
    { new: true }
  );
}

module.exports = {
  setUserTrip,
  archiveTrip
};
