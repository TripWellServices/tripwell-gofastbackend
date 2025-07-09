const express = require("express");
const router = express.Router();
const User = require("../../models/User");

// 🔥 GET /tripwell/whoami — identity-only hydration
router.get("/whoami", async (req, res) => {
  try {
    const firebaseId = req.user.uid;

    const user = await User.findOne({ firebaseId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 🧼 Identity-only return — no trip hydration, no extras
    res.json({
      userId: user._id,
      role: user.role || "participant",
      firebaseId: user.firebaseId,
      email: user.email,
      name: user.name
    });
  } catch (err) {
    console.error("❌ whoami error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", (req, res) => {
  res.send("✅ TripWell whoami route is mounted and clean.");
});

module.exports = router;