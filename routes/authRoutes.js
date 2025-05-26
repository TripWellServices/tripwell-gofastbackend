const express = require('express');
const passport = require('passport');
const AuthController = require('../controllers/AuthController');
const router = express.Router();

// Local auth
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Google OAuth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

module.exports = router;
