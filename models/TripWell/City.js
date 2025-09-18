const mongoose = require('mongoose');

const CitySchema = new mongoose.Schema({
  cityName: { type: String, required: true, unique: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('City', CitySchema);
