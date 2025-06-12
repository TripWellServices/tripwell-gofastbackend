import mongoose from 'mongoose';
const { Schema } = mongoose;

const AttractionSchema = new Schema({
  tripId: {
    type: Schema.Types.ObjectId,
    ref: 'TripBase',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  location: String,
  notes: String,
  gptGenerated: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Attraction || mongoose.model('Attraction', AttractionSchema);
