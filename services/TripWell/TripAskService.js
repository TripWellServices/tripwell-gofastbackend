const UserTripAsk = require("../../models/TripWell/TripAsk");

async function handleTripAsk({ tripId, userId, userInput }) {
  if (!userInput || !tripId) throw new Error("Missing input or tripId");

  const savedAsk = await UserTripAsk.create({
    tripId,
    userId,
    userInput,
  });

  return { askId: savedAsk._id, message: "User ask recorded." };
}

module.exports = { handleTripAsk };
