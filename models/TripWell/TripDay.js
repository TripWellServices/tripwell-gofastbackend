// models/TripWell/TripDay.js

import mongoose from 'mongoose';
const { Schema } = mongoose;

const TripDaySchema = new Schema({
  tripId: {
    type: Schema.Types.ObjectId,
    ref: 'TripBase',
    required: true,
  },
  dayIndex: {
    type: Number, // Day 1, Day 2, etc.
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String, // present-tense name of the city/location
    default: '',
  },

  // Modular references (expandable)
  activityIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Activity',
  }],
  foodIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Food',
  }],
  // Future: mediaIds, lodgingIds, noteIds, etc.
}, {
  timestamps: true
});

export default mongoose.models.TripDay || mongoose.model('TripDay', TripDaySchema);
