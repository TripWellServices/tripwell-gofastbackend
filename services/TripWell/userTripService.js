const User = require("../../models/User");

// 🔗 Link trip _id to user by userId (ObjectId)
async function setUserTrip(userId, tripId) {
  if (!tripId) throw new Error("Missing tripId");

  const user = await User.findByIdAndUpdate(
    userId,
    { tripId: tripId.toString() }, // just to ensure cleanliness
    { new: true }
  );

  if (!user) throw new Error(`User not found for _id: ${userId}`);
  return user;
}

// 💤 Archive trip
async function archiveTrip(userId, tripId) {
  return await User.findByIdAndUpdate(
    userId,
    {
      tripId: null,
      pastTripId: tripId.toString()
    },
    { new: true }
  );
}

module.exports = {
  setUserTrip,
  archiveTrip
};
