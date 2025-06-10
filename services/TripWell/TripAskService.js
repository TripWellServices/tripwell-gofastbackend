const UserTripAsk = require("../../models/TripWell/TripAsk");

async function handAsk({ tripId, userId, userInput }) {
  if (!userInput || !tripId) throw new Error("Missing input or tripId");

  const savedAsk = await UserTripAsk.create({
    tripId,
    userId,
    userInput,
    dateString: new Date().toISOString().split("T")[0],
  });

  return { askId: savedAsk._id, message: "User ask recorded." };
}

module.exports = { handAsk };
