// models/TripWell/Hotel.js

import mongoose from 'mongoose';
const { Schema } = mongoose;

const HotelSchema = new Schema({
  tripId: {
    type: Schema.Types.ObjectId,
    ref: 'TripBase',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  location: String,     // City or general area (e.g., "Paris")
  address: String,      // Optional — full address
  vibe: String,         // Optional tag like "luxurious", "budget", "boutique"
}, {
  timestamps: true,
});

export default mongoose.models.Hotel || mongoose.model('Hotel', HotelSchema);
