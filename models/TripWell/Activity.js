import mongoose from 'mongoose';
const { Schema } = mongoose;

const ActivitySchema = new Schema({
  tripId: {
    type: Schema.Types.ObjectId,
    ref: 'TripBase',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  time: String, // Optional: "2:00 PM"
  location: String,
  notes: String,
  gptGenerated: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);
