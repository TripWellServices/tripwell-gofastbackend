const User = require("../../models/User");

// 🔗 Link trip _id to user model
async function setUserTrip(firebaseId, tripId) {
  const user = await User.findOneAndUpdate(
    { firebaseId },
    { tripId }, // stored in user schema as tripId
    { new: true }
  );

  if (!user) throw new Error(`User not found for firebaseId: ${firebaseId}`);
  return user;
}

// 💤 Archive trip when finished or user leaves trip
async function archiveTrip(firebaseId, tripId) {
  return await User.findOneAndUpdate(
    { firebaseId },
    {
      tripId: null,
      pastTripId: tripId
    },
    { new: true }
  );
}

module.exports = {
  setUserTrip,
  archiveTrip
};
