const RunCrew = require('../../models/runcrew/RunCrew');
const User = require('../../models/User');

const createCrew = async (name, inviteCode, leaderUserId) => {
  const existing = await RunCrew.findOne({ inviteCode });
  if (existing) throw new Error('Invite code already in use.');

  const newCrew = new RunCrew({
    name,
    inviteCode,
    members: [leaderUserId]
  });
  await newCrew.save();
  await User.findByIdAndUpdate(leaderUserId, { runCrewId: newCrew._id });
  return newCrew;
};

const joinCrew = async (userId, inviteCode) => {
  const crew = await RunCrew.findOne({ inviteCode }).populate('members');
  if (!crew) throw new Error('Crew not found.');

  if (!crew.members.some(id => id.toString() === userId)) {
    crew.members.push(userId);
    await crew.save();
  }
  await User.findByIdAndUpdate(userId, { runCrewId: crew._id });
  return crew;
};

module.exports = { createCrew, joinCrew };
