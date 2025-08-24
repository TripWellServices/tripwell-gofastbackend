const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const TripWellUser = require("../../models/TripWellUser");



// GET /tripwell/admin/test - Test route to verify TripWellUser model
router.get("/test", async (req, res) => {
  try {
    console.log("🔍 Testing TripWellUser model access...");
    console.log("🔍 Model path:", require.resolve("../../models/TripWellUser"));
    
    const userCount = await TripWellUser.countDocuments();
    console.log("✅ User count:", userCount);
    
    // Try to get one user to verify the model works
    const sampleUser = await TripWellUser.findOne();
    console.log("✅ Sample user:", sampleUser ? sampleUser.email : "No users found");
    
    res.json({ 
      message: "TripWellUser model is accessible", 
      userCount: userCount,
      modelPath: "models/TripWellUser",
      sampleUser: sampleUser ? { email: sampleUser.email, id: sampleUser._id } : null
    });
  } catch (error) {
    console.error("❌ Test route error:", error);
    res.status(500).json({ error: "Test route failed", details: error.message });
  }
});

// GET /tripwell/admin/users - Fetch all users for admin dashboard
router.get("/users", async (req, res) => {
  try {
    const users = await TripWellUser.find({}).sort({ createdAt: -1 });
    
    // Transform data for admin dashboard - only use fields that exist in the model
    const adminUsers = users.map(user => ({
      userId: user._id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      createdAt: user.createdAt,
      lastActiveAt: user.updatedAt, // Using updatedAt as proxy for last active
      tripId: user.tripId,
      tripCreatedAt: user.tripId ? user.createdAt : null, // If they have a trip, use creation date
      tripCompletedAt: null, // This field doesn't exist in the model yet
      role: user.role || 'noroleset',
      profileComplete: user.profileComplete || false
    }));
    
    res.json(adminUsers);
  } catch (error) {
    console.error("❌ Admin users fetch error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// DELETE /tripwell/admin/users/:id - Delete a user and all associated data
router.delete("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Find the user first to get their email for logging
    const userToDelete = await TripWellUser.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Import models for cascade deletion
    const TripIntent = require("../../models/TripWell/TripIntent");
    const JoinCode = require("../../models/TripWell/JoinCode");
    const TripItinerary = require("../../models/TripWell/TripItinerary");
    
    // Start a session for transaction
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        // 1. Delete all TripIntents for this user
        const deletedTripIntents = await TripIntent.deleteMany({ userId }, { session });
        console.log(`🗑️ Deleted ${deletedTripIntents.deletedCount} TripIntents for user ${userToDelete.email}`);
        
        // 2. Delete all JoinCodes for this user
        const deletedJoinCodes = await JoinCode.deleteMany({ userId }, { session });
        console.log(`🗑️ Deleted ${deletedJoinCodes.deletedCount} JoinCodes for user ${userToDelete.email}`);
        
        // 3. Delete all TripItineraries for this user
        const deletedTripItineraries = await TripItinerary.deleteMany({ userId }, { session });
        console.log(`🗑️ Deleted ${deletedTripItineraries.deletedCount} TripItineraries for user ${userToDelete.email}`);
        
        // 4. Finally delete the user
        const deletedUser = await TripWellUser.findByIdAndDelete(userId, { session });
        console.log(`✅ Admin deleted user: ${deletedUser.email} (${userId})`);
      });
      
      res.json({ 
        message: "User and all associated data deleted successfully",
        userEmail: userToDelete.email
      });
      
    } finally {
      await session.endSession();
    }
    
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
