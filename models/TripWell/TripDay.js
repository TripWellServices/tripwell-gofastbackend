const mongoose = require("mongoose");

const blockSchema = new mongoose.Schema({
  title: String,
  desc: String
}, { _id: false });

const tripDaySchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TripBase",
    required: true
  },
  dayIndex: {
    type: Number,
    required: true
  },
  summary: {
    type: String
  },
  blocks: {
    morning: blockSchema,
    afternoon: blockSchema,
    evening: blockSchema
  }
}, { timestamps: true });

module.exports = mongoose.model("TripDay", tripDaySchema);
