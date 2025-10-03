const UserService = require('../services/GoFast/UserService');

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // assuming verifyToken puts user info into req.user
    const user = await UserService.getUserById(userId);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getProfile };
