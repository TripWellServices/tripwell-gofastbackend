const mongoose = require("mongoose");

const TripReflectionSchema = new mongoose.Schema(
  {
    tripId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "TripBase", 
      required: true 
    },
    dayIndex: { type: Number, required: true },
    userId: { 
      type: String, 
      required: true 
    },

    // Pulled from TripDay for recall
    summary: { type: String, default: "" },

    // Mood tags or sentiment categories (multiple selection)
    moodTags: { type: [String], default: [] },

    // Freeform reflection text
    journalText: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("TripReflection", TripReflectionSchema);