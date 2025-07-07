const User = require("../../models/User");

// Sets itineraryId on user model
async function setUserItineraryId(userId, itineraryId) {
  if (!userId || !itineraryId) throw new Error("Missing userId or itineraryId");

  const updated = await User.findOneAndUpdate(
    { userId },
    { itineraryId: itineraryId.toString() },
    { new: true }
  );

  if (!updated) {
    throw new Error(`User not found or update failed for ${userId}`);
  }

  return updated;
}

module.exports = { setUserItineraryId };