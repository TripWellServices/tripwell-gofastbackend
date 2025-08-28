const express = require("express");
const router = express.Router();
const TripWellUser = require("../../models/TripWellUser");

// DELETE /tripwell/admin/delete/user/:id - Simple user deletion
router.delete("/user/:id", async (req, res) => {
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
