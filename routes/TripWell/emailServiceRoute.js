// emailServiceRoute.js
// Route for sending welcome emails via Python microservice

const express = require("express");
const router = express.Router();
const axios = require("axios");

// Environment variables for email service
const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL || "http://localhost:8000";

/**
 * Send welcome email to a new user
 * POST /tripwell/email/welcome
 */
router.post("/welcome", async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: "Email and name are required"
      });
    }

    console.log(`📧 Sending welcome email to ${email} (${name})`);

    // Call Python email microservice
    const emailResponse = await axios.post(`${EMAIL_SERVICE_URL}/emails/welcome`, {
      email: email,
      name: name
    }, {
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (emailResponse.data.status === "sent") {
      console.log(`✅ Welcome email sent successfully to ${email}`);
      return res.status(200).json({
        success: true,
        message: "Welcome email sent successfully",
        email: email,
        name: name
      });
    } else {
      console.error(`❌ Email service returned unexpected status: ${emailResponse.data.status}`);
      return res.status(500).json({
        success: false,
        message: "Email service returned unexpected status"
      });
    }

  } catch (error) {
    console.error("❌ Error sending welcome email:", error.message);
    
    // Handle different types of errors
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: "Email service is unavailable",
        error: "Connection refused to email service"
      });
    } else if (error.code === 'ETIMEDOUT') {
      return res.status(504).json({
        success: false,
        message: "Email service timeout",
        error: "Request timed out"
      });
    } else if (error.response) {
      // Email service returned an error
      return res.status(error.response.status).json({
        success: false,
        message: "Email service error",
        error: error.response.data?.detail || error.response.data?.message || "Unknown error"
      });
    } else {
      // Other errors
      return res.status(500).json({
        success: false,
        message: "Failed to send welcome email",
        error: error.message
      });
    }
  }
});

/**
 * Health check for email service
 * GET /tripwell/email/health
 */
router.get("/health", async (req, res) => {
  try {
    const healthResponse = await axios.get(`${EMAIL_SERVICE_URL}/health`, {
      timeout: 5000
    });

    return res.status(200).json({
      success: true,
      message: "Email service is healthy",
      emailService: healthResponse.data
    });

  } catch (error) {
    console.error("❌ Email service health check failed:", error.message);
    
    return res.status(503).json({
      success: false,
      message: "Email service is unhealthy",
      error: error.message
    });
  }
});

module.exports = router;
