// services/TripWell/userTripService.js

const User = require("../../models/User");

async function setUserTrip(userId, tripId) {
  if (!tripId || !userId) throw new Error("Missing required ID");

  const user = await User.findByIdAndUpdate(
    userId,
    { tripId, role: "originator" },
    { new: true }
  );

  if (!user) throw new Error(`User not found for _id: ${userId}`);
  return user;
}

module.exports = {
  setUserTrip,
};
