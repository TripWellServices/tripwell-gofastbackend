// /services/AuthService.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/GoFast/User');
const dotenv = require('dotenv');
dotenv.config();

const AuthService = {
  async registerUser(email, password) {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error('User already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    return { message: 'User registered successfully' };
  },

  async loginUser(email, password) {
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return { token };
  },

  verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }
};

module.exports = AuthService;
