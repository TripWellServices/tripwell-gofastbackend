function calculateMatchScore(user1, user2) {
  let score = 0;

  if (Math.abs(parseFloat(user1.pace) - parseFloat(user2.pace)) <= 0.25) score += 150;
  if (user1.preferredTime.some(slot => user2.preferredTime.includes(slot))) score += 100;
  if (user1.location === user2.location) score += 75;
  if (user1.motivation.some(m => user2.motivation.includes(m))) score += 50;
  if (!user1.matchHistory?.includes(user2._id)) score += 50;
  if (user1.gender === user2.gender || user1.gender === "any") score += 50;
  if (user1.matchReady && user2.matchReady) score += 25;

  return score;
}

module.exports = { calculateMatchScore };
