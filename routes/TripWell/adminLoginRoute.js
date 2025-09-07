const express = require("express");
const router = express.Router();

// Simple admin auth middleware
const verifyAdminAuth = (req, res, next) => {
  const { username, password } = req.headers;
  
  // Simple admin credentials - in production, use environment variables
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'tripwell2025';
  
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: "Invalid admin credentials" });
  }
};

// POST /tripwell/admin/login - Validate admin credentials
router.post("/login", (req, res) => {
  console.log("🚨 ADMIN LOGIN ROUTE HIT!");
  const { username, password } = req.body;
  
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'tripwell2025';
  
  // Debug logging
  console.log("🔐 Admin login attempt:");
  console.log("  Received username:", username);
  console.log("  Expected username:", ADMIN_USERNAME);
  console.log("  Username match:", username === ADMIN_USERNAME);
  console.log("  Password match:", password === ADMIN_PASSWORD);
  console.log("  Environment variables set:", {
    ADMIN_USERNAME: !!process.env.ADMIN_USERNAME,
    ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD
  });
  
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({ 
      success: true, 
      message: "Admin login successful",
      username: username
    });
  } else {
    res.status(401).json({ 
      success: false, 
      error: "Invalid admin credentials" 
    });
  }
});

module.exports = router;
