const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // 🔐 Auth core (from Firebase)
  firebaseId: { type: String, required: true, unique: true },
  userId: { type: String, required: true, unique: true }, // mirror of firebaseId
  email: { type: String, required: true },
  name: String,
  preferredName: String,

  // 📍 Location
  location: String, // e.g., "Baltimore, MD"

  // 🌴 TripWell profile data
  profile: {
    familySituation: [String],   // ["I'm a parent", "Travel solo"]
    travelStyle: [String],       // ["Planner", "DIY travel"]
    tripVibe: [String],          // ["Culture", "Fitness"]
  },

  // 🧭 Active trip state (MVP 1)
  tripId: { type: String },         // ✅ This is the one true active trip

  // 📦 Archived trip state (MVP 2)
  pastTripId: { type: String },     // ✅ Last trip stored after completion

  // 🏷️ Role in the system (new!)
  role: {
    type: String,
    enum: ["originator", "participant", "viewer", "admin", "noroleset"],
    default: "noroleset"
  },

  // 🏃 GoFast training state (optional)
  userStatus: {
    type: String,
    enum: [
      "registered",
      "onboarding",
      "ready_to_train",
      "training",
      "inactive",
      "race_mode",
      "race_day",
      "reviewing",
      "completed"
    ],
    default: "registered"
  },

  lastGarminLog: { type: Date },

  // ⏱ Timestamps
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
