const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // 🔐 Firebase Auth
  firebaseId: { type: String, required: true, unique: true },

  // 🔁 Internal Identity Mirror (from _id)
  userId: { type: mongoose.Schema.Types.ObjectId, unique: true },

  // 🧑 Personal Info
  email: { type: String, default: "" },
  name: { type: String, default: "" },
  preferredName: { type: String, default: "" },

  // 📍 Location
  location: { type: String, default: "" },

  // 🌴 Profile Preferences
  profile: {
    travelStyle: { type: [String], default: [] },
    tripVibe: { type: [String], default: [] }
  },

  // 🧭 Active Trip State
  tripId: { type: String, default: null },
  tripIntentId: { type: String, default: null },
  itineraryId: { type: String, default: null },
  anchorSelectComplete: { type: Boolean, default: false },
  tripStarted: { type: Boolean, default: false },

  // 🗂 Archived Trips
  pastTripId: { type: String, default: null },

  // 🎭 Role
  role: { type: String, default: "noroleset" },

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

  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);