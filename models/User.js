
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firebaseId: { type: String, required: true, unique: true },
  userId: { type: String, required: true, unique: true },
  email: String,
  name: String,
  preferredName: String,
  location: String, // City, State

  // TripWell extensions
  familySituation: [String], // e.g., ["I'm a parent", "Married/partnered"]
  travelStyle: [String],     // e.g., ["Planner", "Chill trips"]
  tripVibe: [String],        // e.g., ["Culture", "Fitness / Staying active"]

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
