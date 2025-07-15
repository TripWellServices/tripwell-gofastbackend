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
  },
  isComplete: {
    type: Boolean,
    default: false
  },
  modifiedByUser: {
    type: Boolean,
    default: false
  },
  modificationMethod: {
    type: String,
    enum: ["gpt", "manual", null],
    default: null
  }
}, { timestamps: true });
