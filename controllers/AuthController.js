// /controllers/AuthController.js

const AuthService = require('../services/GoFast/AuthService');

const AuthController = {
  async register(req, res) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.registerUser(email, password);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.loginUser(email, password);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};

module.exports = AuthController;
