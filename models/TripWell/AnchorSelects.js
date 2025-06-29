// models/TripWell/AnchorSelects.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const AnchorSelectSchema = new Schema({
  tripId: {
    type: Schema.Types.ObjectId,
    ref: "TripBase",
    required: true,
  },
  userId: {
    type: String, // Firebase UID
    required: true,
  },
  selectedAnchors: [
    {
      type: String, // Raw anchor titles from user checkboxes
    }
  ],
  rawNotes: {
    type: String, // Optional freeform text, future GPT fodder
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("AnchorSelects", AnchorSelectSchema);
