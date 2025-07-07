const User = require("../../models/User");

async function setTripIntentId(userId, tripIntentId) {
  if (!userId || !tripIntentId) {
    throw new Error("Missing userId or tripIntentId");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { tripIntentId: tripIntentId.toString() },
    { new: true }
  );

  if (!updatedUser) {
    throw new Error(`User not found for _id: ${userId}`);
  }

  return updatedUser;
}

module.exports = setTripIntentId;