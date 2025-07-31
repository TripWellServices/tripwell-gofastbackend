const mongoose = require("mongoose");

const tripWellUserSchema = new mongoose.Schema(
  {
    firebaseId: { type: String, required: true, unique: true },
    email: { type: String, default: "" },
    name: { type: String, default: "" },
    city: { type: String, default: "" },
    travelStyle: { type: [String], default: [] },
    tripVibe: { type: [String], default: [] },
    tripId: { type: String, default: null },
    role: { type: String, default: "noroleset" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TripWellUser", tripWellUserSchema);
