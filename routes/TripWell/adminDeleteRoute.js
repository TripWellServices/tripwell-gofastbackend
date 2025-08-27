const express = require("express");
const router = express.Router();
const TripWellUser = require("../../models/TripWellUser");

// Simple admin auth middleware
const verifyAdminAuth = (req, res, next) => {
  console.log("🔐 Admin auth middleware hit");
  const { username, password } = req.headers;
  console.log("🔐 Headers received:", { username, password: password ? '***' : 'undefined' });
  
  // Simple admin credentials - in production, use environment variables
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'tripwell2025';
  
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    console.log("✅ Admin auth successful");
    next();
  } else {
    console.log("❌ Admin auth failed");
    res.status(401).json({ error: "Invalid admin credentials" });
  }
};

// DELETE /tripwell/admin/delete/user/:id - Simple user deletion
router.delete("/user/:id", verifyAdminAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(`🗑️ Deleting user: ${userId}`);
    
    // Find and delete the user
    const deletedUser = await TripWellUser.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      console.log(`❌ User not found: ${userId}`);
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`✅ Deleted user: ${deletedUser.email}`);
    res.json({ 
      success: true, 
      message: `User ${deletedUser.email} deleted successfully`
    });

  } catch (error) {
    console.error(`❌ Error deleting user ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

module.exports = router;
