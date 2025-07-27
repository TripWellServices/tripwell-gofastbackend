const mongoose = require("mongoose");

const tripWellUserSchema = new mongoose.Schema({
  // 🔐 Firebase Auth
  firebaseId: { type: String, required: true, unique: true },

  // 🧑 Identity
  email: { type: String, default: "" },
  name: { type: String, default: "" },

  // 📍 Location
  city: { type: String, default: "" },

  // 🌴 Preferences
  travelStyle: { type: [String], default: [] },
  tripVibe: { type: [String], default: [] },

  // 🧭 Active Trip
  tripId: { type: String, default: null },

  // 🎭 Role
  role: { type: String, default: "noroleset" },
}, { timestamps: true });

module.exports = mongoose.model("TripWellUser", tripWellUserSchema);
