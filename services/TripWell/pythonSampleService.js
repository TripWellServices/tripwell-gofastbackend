/**
 * Python Sample Service - Bridges Node.js to Python AI service
 * Handles sample generation by calling the Python FastAPI service
 */

const axios = require('axios');

// Get Python service URL from environment
const PYTHON_SERVICE_URL = process.env.TRIPWELL_AI_BRAIN || 'http://localhost:5000';

/**
 * Generate rich prompt using Python service
 * @param {Object} requestData - Sample generation request
 * @returns {Object} Generated prompt
 */
async function generatePromptPython(requestData) {
  try {
    console.log("🐍 Calling Python prompt generation service...");
    console.log("🐍 Request data:", JSON.stringify(requestData, null, 2));

    const response = await axios.post(`${PYTHON_SERVICE_URL}/generate-prompt`, {
      city: requestData.city,
      persona_weights: requestData.persona_weights,
      budget_level: requestData.budget_level,
      romance_level: requestData.romance_level,
      caretaker_role: requestData.caretaker_role,
      flexibility: requestData.flexibility,
      who_with: requestData.who_with,
      daily_spacing: requestData.daily_spacing,
      season: requestData.season,
      purpose: requestData.purpose,
      budget: requestData.budget
    }, {
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.status === 'success') {
      console.log("✅ Python prompt generation successful");
      
      // Now call OpenAI with the prompt
      const { OpenAI } = require("openai");
      const openai = new OpenAI();
      
      console.log("🤖 Calling OpenAI with generated prompt...");
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { 
            role: "system", 
            content: "You are Angela, TripWell's travel assistant. Return structured JSON only. No prose. No markdown." 
          },
          { role: "user", content: response.data.prompt }
        ],
        temperature: 0.7,
      });

      const content = completion.choices[0].message.content || "{}";
      console.log("✅ OpenAI response received");
      
      let samplesData;
      try {
        samplesData = JSON.parse(content);
      } catch (error) {
        const jsonString = content.replace(/'/g, '"');
        samplesData = JSON.parse(jsonString);
      }
      
      console.log("✅ Samples parsed:", {
        attractions: samplesData.attractions?.length || 0,
        restaurants: samplesData.restaurants?.length || 0,
        neatThings: samplesData.neatThings?.length || 0
      });
      
      return {
        success: true,
        samples: samplesData,
        metadata: response.data.metadata,
        message: "Samples generated successfully using Python + OpenAI"
      };
    } else {
      console.error("❌ Python service returned error:", response.data.message);
      return {
        success: false,
        samples: {},
        metadata: {},
        message: response.data.message || "Python service error"
      };
    }

  } catch (error) {
    console.error("❌ Python prompt generation failed:", error.message);
    
    // Handle different types of errors
    if (error.code === 'ECONNREFUSED') {
      console.error("❌ Python service is not running or not accessible");
      return {
        success: false,
        prompt: "",
        metadata: {},
        message: "Python AI service is not available"
      };
    }
    
    if (error.response) {
      console.error("❌ Python service error response:", error.response.data);
      return {
        success: false,
        prompt: "",
        metadata: {},
        message: `Python service error: ${error.response.data.detail || error.response.data.message || 'Unknown error'}`
      };
    }
    
    return {
      success: false,
      prompt: "",
      metadata: {},
      message: `Python service call failed: ${error.message}`
    };
  }
}

/**
 * Fallback to Node.js OpenAI service if Python is unavailable
 * @param {Object} requestData - Sample generation request
 * @returns {Object} Generated samples
 */
async function generatePersonaSamplesFallback(requestData) {
  try {
    console.log("🔄 Falling back to Node.js OpenAI service...");
    
    // Import the existing Node.js service
    const { generatePersonaSamples } = require('./personaSamplesService');
    
    // Convert request data to match Node.js service signature
    const samples = await generatePersonaSamples(
      requestData.city,
      requestData.persona_weights,
      requestData.budget,
      requestData.who_with,
      requestData.season,
      requestData.purpose
    );
    
    return {
      success: true,
      samples,
      metadata: {
        city: requestData.city,
        persona_weights: requestData.persona_weights,
        budget_level: requestData.budget_level,
        who_with: requestData.who_with,
        season: requestData.season,
        source: "nodejs_fallback"
      },
      message: "Samples generated using Node.js fallback"
    };
    
  } catch (error) {
    console.error("❌ Node.js fallback also failed:", error);
    return {
      success: false,
      samples: {},
      metadata: {},
      message: `Both Python and Node.js services failed: ${error.message}`
    };
  }
}

/**
 * Main function to generate samples with Python fallback
 * @param {Object} requestData - Sample generation request
 * @returns {Object} Generated samples
 */
async function generatePersonaSamplesWithFallback(requestData) {
  // Try Python service first
  const pythonResult = await generatePersonaSamplesPython(requestData);
  
  if (pythonResult.success) {
    return pythonResult;
  }
  
  console.log("🔄 Python service failed, trying Node.js fallback...");
  return await generatePersonaSamplesFallback(requestData);
}

/**
 * Health check for Python service
 * @returns {Object} Health status
 */
async function checkPythonServiceHealth() {
  try {
    const response = await axios.get(`${PYTHON_SERVICE_URL}/health`, {
      timeout: 5000
    });
    
    return {
      healthy: true,
      status: response.data.status,
      service: response.data.service
    };
  } catch (error) {
    return {
      healthy: false,
      status: "unhealthy",
      error: error.message
    };
  }
}

module.exports = {
  generatePersonaSamplesWithFallback,
  generatePersonaSamplesPython,
  generatePersonaSamplesFallback,
  checkPythonServiceHealth
};
