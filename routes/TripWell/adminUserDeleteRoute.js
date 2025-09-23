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

// DELETE /tripwell/admin/users/:id - Delete user with modular cascade deletion
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
    
    // Import modular cascade deletion service
    const { deleteUserWithCascade } = require("../../services/TripWell/modularCascadeService");
    
    // Start a session for transaction
    const session = await mongoose.startSession();
    
    try {
      const deletionResult = await session.withTransaction(async () => {
        console.log(`🔍 DEBUG: Starting modular cascade deletion for user ${userId}`);
        
        // Use modular cascade deletion service
        const result = await deleteUserWithCascade(userId, session);
        
        console.log(`🗑️ Modular cascade deleted user ${userToDelete.email}:`, {
          tripsDeleted: result.tripsDeleted,
          totalRecordsDeleted: result.totalRecordsDeleted,
          deletedCollections: result.deletedCollections
        });
        
        return result;
      });
      
      console.log(`✅ Admin deleted user: ${userToDelete.email} (${userId}) with modular cascade`);
      res.json({ 
        message: "User and all associated data deleted successfully",
        userEmail: userToDelete.email,
        deletionResult: {
          tripsDeleted: deletionResult.tripsDeleted,
          totalRecordsDeleted: deletionResult.totalRecordsDeleted
        }
      });
      
    } finally {
      await session.endSession();
    }
    
  } catch (error) {
    console.error("❌ Admin user delete error:", error);
    res.status(500).json({ 
      error: "Failed to delete user",
      details: error.message 
    });
  }
});

module.exports = router;
