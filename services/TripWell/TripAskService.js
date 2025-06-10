const UserTripAsk = require("../../models/TripWell/TripAsk");

async function handAsk({ tripId, userId, userInput }) {
  if (!userInput || !tripId || !userId) {
    throw new Error("Missing input or identifiers");
  }

  const savedAsk = await UserTripAsk.create({
    tripId,
    userId,
    userInput,
    dateString: new Date().toISOString().split("T")[0],
  });

  return { askId: savedAsk._id };
}

module.exports = { handAsk };
