const mongoose = require('mongoose');

const matchEventSchema = new mongoose.Schema({
  user1: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  user2: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  matchScore: Number,
  matchedAt: { type: Date, default: Date.now },
  feedback: {
    user1: String,
    user2: String
  },
  active: { type: Boolean, default: true }
});

module.exports = mongoose.model('MatchEvent', matchEventSchema);
