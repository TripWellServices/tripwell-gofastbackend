const User = require("../../models/User");

// 🔗 Link tripId to user (used after create or join)
async function setUserTrip(firebaseId, tripId) {
  const user = await User.findOneAndUpdate(
    { firebaseId },
    { tripId },
    { new: true }
  );

  if (!user) throw new Error(`User not found for firebaseId: ${firebaseId}`);
  return user;
}

// 💤 Archive trip when finished
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
