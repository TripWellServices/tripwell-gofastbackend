const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // 🔐 Auth core (from Firebase)
  firebaseId: { type: String, required: true, unique: true },
  userId: { type: String, required: true, unique: true }, // mirror of firebaseId

  // Optional early-stage fields
  email: { type: String, default: "" },
  name: { type: String, default: "" },
  preferredName: { type: String, default: "" },

  // 📍 Location
  location: { type: String, default: "" },

  // 🌴 TripWell profile data
  profile: {
    familySituation: { type: [String], default: [] },
    travelStyle: { type: [String], default: [] },
    tripVibe: { type: [String], default: [] }
  },

  // 🧭 Active trip state (MVP 1)
  tripId: { type: String, default: null },

  // 📦 Archived trip state (MVP 2)
  pastTripId: { type: String, default: null },

  // 🧢 Role field
  role: { type: String, default: "noroleset" },

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

  lastGarminLog: { type: Date, default: null },

  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
