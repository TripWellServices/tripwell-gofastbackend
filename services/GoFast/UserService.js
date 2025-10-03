const User = require('../../models/GoFast/User');

const createUser = async (data) => {
  return await User.create(data);
};

const updateUser = async (userId, updates) => {
  return await User.findByIdAndUpdate(userId, updates, { new: true });
};

const getUserById = async (userId) => {
  return await User.findById(userId);
};

module.exports = { createUser, updateUser, getUserById };
