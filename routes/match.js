const express = require('express');
const router = express.Router();
const User = require('../models/User');

// EXISTING: find matches route
// router.post('/:userId', async (req, res) => { ... })

// NEW: confirm a match route
router.post('/confirm/:userId/:matchedUserId', async (req, res) => {
  try {
    const { userId, matchedUserId } = req.params;

    const user = await User.findById(userId);
    const matchedUser = await User.findById(matchedUserId);

    if (!user || !matchedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Build mini match memory object
    const matchMemory = {
      madeMyMatch: true,
      matchedUserId: matchedUser._id,
      matchedUserName: matchedUser.name,
      matchDate: new Date(),
      paceAtMatch: matchedUser.pace,
      vibeAtMatch: matchedUser.vibe
    };

    // Update user's matchHistory
    user.matchHistory = user.matchHistory || [];
    user.matchHistory.push(matchMemory);
    await user.save();

    // Simulate sending an email
    console.log(`Simulated Email: Congrats ${user.name}, you matched with ${matchedUser.name}!`);

    res.json({ message: "Match confirmed and saved!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during match confirmation." });
  }
});

module.exports = router;