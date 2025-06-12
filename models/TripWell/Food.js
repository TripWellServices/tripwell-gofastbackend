// models/TripWell/Food.js

import mongoose from 'mongoose';
const { Schema } = mongoose;

const FoodSchema = new Schema({
  tripId: {
    type: Schema.Types.ObjectId,
    ref: 'TripBase',
    required: true,
  },
  mealType: {
    type: String, // e.g. "coffee", "breakfast", "bakery"
    required: true,
  },
  name: String,     // optional: "Café de Flore"
  location: String, // optional
  time: String,     // optional
}, {
  timestamps: true,
});

export default mongoose.models.Food || mongoose.model('Food', FoodSchema);
