const MatchEvent = require('../../models/GoFastMatching/MatchEvent');
const User = require('../../models/GoFast/User');

async function saveMatch(user1, user2, score) {
  await MatchEvent.create({
    user1: user1._id,
    user2: user2._id,
    matchScore: score
  });

  await User.findByIdAndUpdate(user1._id, {
    $push: { matchHistory: user2._id },
    matchReady: false
  });

  await User.findByIdAndUpdate(user2._id, {
    $push: { matchHistory: user1._id },
    matchReady: false
  });
}

module.exports = { saveMatch };
