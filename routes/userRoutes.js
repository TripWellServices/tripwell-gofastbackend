const express = require("express");
const router = express.Router();
const User = require("../models/User");

// POST /api/users/create
router.post("/create", async (req, res) => {
  const { name, email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email });
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
