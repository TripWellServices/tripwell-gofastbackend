
const mongoose = require('mongoose');

const CourseProfileSchema = new mongoose.Schema({
  raceName: { type: String, required: true },
  canonicalKey: { type: String, required: true, unique: true },
  profile: String,
  highlights: [String],
  coachNote: String,
  source: { type: String, default: 'chatgpt' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CourseProfile', CourseProfileSchema);