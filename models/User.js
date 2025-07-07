const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // 🔐 Firebase Auth
  firebaseId: { type: String, required: true, unique: true },
  userId: { type: String, required: true, unique: true }, // mirror of firebaseId

  // 🧑 Personal Info
  email: { type: String, default: "" },
  name: { type: String, default: "" },
  preferredName: { type: String, default: "" },

  // 📍 Location
  location: { type: String, default: "" },

  // 🌴 Profile Preferences (static, not trip-specific)
  profile: {
    travelStyle: { type: [String], default: [] },
    tripVibe: { type: [String], default: [] }
  },

  // 🧭 Active Trip State
  tripId: { type: String, default: null },          // Assigned on create/join
  tripIntentId: { type: String, default: null },    // Set after intent form
  itineraryId: { type: String, default: null },     // Set after itinerary built
  anchorSelectComplete: { type: Boolean, default: false }, // True after anchor select
  tripStarted: { type: Boolean, default: false },   // True once trip is kicked off

  // 🗂 Archived Trips (MVP2+)
  pastTripId: { type: String, default: null },

  // 🎭 Role Assignment
  role: { type: String, default: "noroleset" }, // originator or participant

  // 🏃 GoFast Mode
  userStatus: {
    type: String,
    enum: [
      "registered", "onboarding", "ready_to_train", "training", "inactive",
      "race_mode", "race_day", "reviewing", "completed"
    ],
    default: "registered"
  },
  lastGarminLog: { type: Date, default: null },

  // 🕒 Timestamps
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);