const express = require("express");
const router = express.Router();
const TripWellUser = require("../../models/TripWellUser");

// GET /tripwell/admin/users - Fetch all users for admin dashboard
router.get("/users", async (req, res) => {
  try {
    const users = await TripWellUser.find({}).sort({ createdAt: -1 });
    
    // Transform data for admin dashboard
    const adminUsers = users.map(user => ({
      userId: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
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

// DELETE /tripwell/admin/users/:id - Delete a user
router.delete("/users/:id", async (req, res) => {
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

// PUT /tripwell/admin/users/:id - Update user (for future use)
router.put("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    
    const updatedUser = await TripWellUser.findByIdAndUpdate(
      userId, 
      updates, 
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    
    console.log(`✅ Admin updated user: ${updatedUser.email} (${userId})`);
    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("❌ Admin user update error:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

module.exports = router;
