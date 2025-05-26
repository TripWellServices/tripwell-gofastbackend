const express = require('express');
const router = express.Router();

// ✅ FIXED PATH: go up two folders since this file is in `routes/runcrew/`
const { createCrew, joinCrew } = require('../../services/runcrew/RunCrewService');

router.post('/create', async (req, res) => {
  try {
    const { name, inviteCode, leaderUserId } = req.body;
    const crew = await createCrew(name, inviteCode, leaderUserId);
    res.status(201).json(crew);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/join', async (req, res) => {
  try {
    const { userId, inviteCode } = req.body;
