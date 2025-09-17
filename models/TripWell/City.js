const mongoose = require('mongoose');

const CitySchema = new mongoose.Schema({
  cityName: { type: String, required: true, unique: true },
  country: { type: String, required: true },
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('City', CitySchema);
