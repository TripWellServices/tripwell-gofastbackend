const { calculateMatchScore } = require('./matchScorer');
const User = require('../../models/GoFast/User');

async function getTopMatchesForUser(queryUserId) {
  const queryUser = await User.findById(queryUserId);
  const matchReadyUsers = await User.find({ matchReady: true, _id: { $ne: queryUserId } });

  const scored = matchReadyUsers.map(user => {
    const score = calculateMatchScore(queryUser, user);
    return { user, score };
  });

  const topMatches = scored
    .filter(m => m.score >= 450)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return topMatches;
}

module.exports = { getTopMatchesForUser };
