const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
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

// Simple test route without auth to verify route mounting
router.get("/ping", (req, res) => {
  console.log("🏓 Ping route hit!");
  res.json({ message: "Admin route is working!", timestamp: new Date().toISOString() });
});



// GET /tripwell/admin/test - Test route to verify TripWellUser model
router.get("/test", verifyAdminAuth, async (req, res) => {
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
router.get("/users", verifyAdminAuth, async (req, res) => {
  try {
    const users = await TripWellUser.find({}).sort({ createdAt: -1 });
    
    // Transform data for admin dashboard - only use fields that exist in the model
    const adminUsers = users.map(user => ({
      userId: user._id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      createdAt: user.createdAt,
      lastActiveAt: user.updatedAt, // Using updatedAt as proxy for last activity (will be renamed in MVP2)
      tripId: user.tripId,
      tripCreatedAt: user.tripId ? user.createdAt : null, // If they have a trip, use creation date
      tripCompletedAt: null, // This field doesn't exist in the model yet
      role: user.role || 'noroleset',
      profileComplete: user.profileComplete || false,
      funnelStage: user.funnelStage || 'none' // Add funnel stage tracking
    }));
    
    res.json(adminUsers);
  } catch (error) {
    console.error("❌ Admin users fetch error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// DELETE /tripwell/admin/users/:id - Delete a user and all associated data
router.delete("/users/:id", verifyAdminAuth, async (req, res) => {
  console.log("🎯 DELETE /tripwell/admin/users/:id route hit!");
  try {
    const userId = req.params.id;
    console.log(`🗑️ Admin attempting to delete user: ${userId}`);
    
    // Find the user first to get their email for logging
    const userToDelete = await TripWellUser.findById(userId);
    if (!userToDelete) {
      console.log(`❌ User not found in database: ${userId}`);
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

// GET /tripwell/admin/hydrate - Get all users for admin dashboard (admin version of hydrate)
router.get("/hydrate", verifyAdminAuth, async (req, res) => {
  try {
    const users = await TripWellUser.find({}).sort({ createdAt: -1 });
    console.log(`📊 Admin hydrate: Found ${users.length} users in database`);
    
    // Transform data for admin dashboard - only use fields that exist in the model
    const adminUsers = users.map(user => ({
      userId: user._id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      createdAt: user.createdAt,
      lastActiveAt: user.updatedAt, // Using updatedAt as proxy for last activity (will be renamed in MVP2)
      tripId: user.tripId,
      tripCreatedAt: user.tripId ? user.createdAt : null, // If they have a trip, use creation date
      tripCompletedAt: null, // This field doesn't exist in the model yet
      role: user.role || 'noroleset',
      profileComplete: user.profileComplete || false,
      funnelStage: user.funnelStage || 'none' // Add funnel stage tracking
    }));
    
    console.log(`📊 Admin hydrate: Returning ${adminUsers.length} users to frontend`);
    res.json(adminUsers);
  } catch (error) {
    console.error("❌ Admin hydrate error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Add this new route to fix profileComplete
router.put("/fixProfileComplete", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await TripWellUser.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update profileComplete to true
    const updatedUser = await TripWellUser.findByIdAndUpdate(
      user._id,
      { profileComplete: true },
      { new: true }
    );

    console.log(`✅ Fixed profileComplete for user: ${email}`);
    
    res.json({ 
      success: true, 
      message: `Profile complete flag set to true for ${email}`,
      user: updatedUser 
    });
    
  } catch (error) {
    console.error("❌ Error fixing profileComplete:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
