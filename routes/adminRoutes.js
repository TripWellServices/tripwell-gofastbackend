const express = require("express");
const router = express.Router();
const TripWellUser = require("../models/TripWellUser");

// Simple admin auth middleware
const verifyAdminAuth = (req, res, next) => {
  const { username, password } = req.headers;
  
  // Simple admin credentials - in production, use environment variables
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'tripwell2024';
  
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: "Invalid admin credentials" });
  }
};

// GET /admin/users - Fetch all users with admin data
router.get("/users", verifyAdminAuth, async (req, res) => {
  try {
    const users = await TripWellUser.find({}).sort({ createdAt: -1 });
    
    // Transform data for admin dashboard
    const adminUsers = users.map(user => ({
      userId: user._id,
      email: user.email,
      createdAt: user.createdAt,
      lastActiveAt: user.updatedAt, // Using updatedAt as proxy for last active
      tripId: user.tripId,
      tripCreatedAt: user.tripId ? user.createdAt : null, // If they have a trip, use creation date
      tripCompletedAt: null, // TODO: Add this field to TripWellUser model
      role: user.role || 'user',
      profileComplete: user.profileComplete || false
    }));
    
    res.json(adminUsers);
  } catch (error) {
    console.error("❌ Admin users fetch error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// DELETE /admin/users/:id - Delete a user
router.delete("/users/:id", verifyAdminAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Find and delete the user
    const deletedUser = await TripWellUser.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    
    console.log(`✅ Admin deleted user: ${deletedUser.email} (${userId})`);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("❌ Admin user delete error:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

module.exports = router;
