const mongoose = require("mongoose");

const GarminActivitySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  activityDate: { type: String, required: true }, // 'YYYY-MM-DD'
  mileage: Number,
  duration: Number, // in minutes
  pace: String,
  avgHr: Number,
  raw: Object
}, { timestamps: true });

module.exports = mongoose.model("GarminActivity", GarminActivitySchema);
