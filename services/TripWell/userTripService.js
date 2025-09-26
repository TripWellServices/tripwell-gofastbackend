// services/TripWell/userTripService.js

const TripWellUser = require("../../models/TripWell/TripWellUser");

async function setUserTrip(userId, tripId) {
  console.log("🔧 setUserTrip called with:");
  console.log("   userId:", String(userId));
  console.log("   tripId:", String(tripId));
  
  if (!tripId || !userId) throw new Error("Missing required ID");

  console.log("🔧 Updating TripWellUser...");
  const user = await TripWellUser.findByIdAndUpdate(
    userId,
    { tripId, role: "originator" },
    { new: true }
  );

  if (!user) {
    console.error("❌ User not found for _id:", String(userId));
    throw new Error(`User not found for _id: ${userId}`);
  }
  
  console.log("✅ User updated successfully");
  console.log("   Updated tripId:", String(user.tripId));
  console.log("   Updated role:", user.role);
  
  return user;
}

module.exports = {
  setUserTrip,
};
