
import mongoose from 'mongoose';

const CourseProfileSchema = new mongoose.Schema({
  raceName: { type: String, required: true },
  canonicalKey: { type: String, required: true, unique: true },
  profile: String,
  highlights: [String],
  coachNote: String,
  source: { type: String, default: 'chatgpt' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('CourseProfile', CourseProfileSchema);
