/**
 * NeedSmartPromptService - Orchestrates the smart prompt generation flow
 * 
 * Flow:
 * 1. Get user context from MongoDB
 * 2. Call Python to generate smart prompt
 * 3. Save prompt to temp state
 * 4. Use prompt for OpenAI call
 * 5. Parse and return results
 */

const TripPersona = require("../../models/TripWell/TripPersona");
const TripBase = require("../../models/TripWell/TripBase");
const { generatePromptPython } = require('./pythonSampleService');

/**
 * Main service function - orchestrates the entire smart prompt flow
 */
async function needSmartPromptService(tripId, userId) {
  try {
    console.log("🧠 NeedSmartPromptService starting for:", { tripId, userId });
    
    // Step 1: Get user context from MongoDB
    const userContext = await getUserContext(tripId, userId);
    console.log("📋 User context gathered:", userContext);
    
    // Step 2: Call Python to generate smart prompt
    const promptResult = await generatePromptPython(userContext);
    
    if (!promptResult.success) {
      throw new Error(`Python prompt generation failed: ${promptResult.message}`);
    }
    
    console.log("✅ Python prompt generated successfully");
    
    // Step 3: Save prompt to temp state (we'll store it in the request for now)
    // In a real implementation, you might save this to a temporary collection
    const tempPromptState = {
      prompt: promptResult.prompt,
      metadata: promptResult.metadata,
      generatedAt: new Date(),
      tripId,
      userId
    };
    
    console.log("💾 Prompt saved to temp state");
    
    // Step 4: Use prompt for OpenAI call (handled in pythonSampleService)
    // The pythonSampleService already handles the OpenAI call and returns samples
    
    return {
      success: true,
      samples: promptResult.samples,
      prompt: promptResult.prompt,
      metadata: promptResult.metadata,
      tempState: tempPromptState,
      message: "Smart prompt generated and samples created successfully"
    };
    
  } catch (error) {
    console.error("❌ NeedSmartPromptService failed:", error);
    return {
      success: false,
      samples: {},
      prompt: "",
      metadata: {},
      tempState: null,
      message: `Smart prompt service failed: ${error.message}`
    };
  }
}

/**
 * Get complete user context from MongoDB
 */
async function getUserContext(tripId, userId) {
  try {
    console.log("🔍 Gathering user context from MongoDB...");
    
    // Get TripPersona data
    const tripPersona = await TripPersona.findOne({ tripId, userId });
    if (!tripPersona) {
      throw new Error("TripPersona not found");
    }
    
    // Get TripBase data for city and season
    const tripBase = await TripBase.findById(tripId);
    if (!tripBase) {
      throw new Error("TripBase not found");
    }
    
    // Note: TripSetup model doesn't exist, using defaults for now
    console.log("⚠️ Using default values for trip setup data");
    
    // Calculate persona weights from primaryPersona
    const personaWeights = {
      art: tripPersona.primaryPersona === 'art' ? 0.6 : 0.1,
      foodie: tripPersona.primaryPersona === 'foodie' ? 0.6 : 0.1,
      adventure: tripPersona.primaryPersona === 'adventure' ? 0.6 : 0.1,
      history: tripPersona.primaryPersona === 'history' ? 0.6 : 0.1
    };
    
    // Build complete context
    const context = {
      city: tripBase.city,
      persona_weights: personaWeights,
      budget: tripPersona.budget,
      budget_level: tripPersona.budgetLevel,
      romance_level: 0.0, // Default values since TripSetup doesn't exist
      caretaker_role: 0.0,
      flexibility: 0.5,
      who_with: "solo",
      daily_spacing: tripPersona.dailySpacing,
      season: tripBase.season,
      purpose: "vacation" // TODO: get from tripBase or tripSetup
    };
    
    console.log("✅ User context built:", {
      city: context.city,
      persona_weights: context.persona_weights,
      budget: context.budget,
      budget_level: context.budget_level,
      who_with: context.who_with,
      season: context.season
    });
    
    return context;
    
  } catch (error) {
    console.error("❌ Failed to gather user context:", error);
    throw error;
  }
}

/**
 * Save prompt to temporary state (for future use)
 * In a real implementation, you might save this to a temporary collection
 */
async function savePromptToTempState(promptData) {
  try {
    // For now, we'll just log it
    // In production, you might save to a temporary collection or cache
    console.log("💾 Saving prompt to temp state:", {
      tripId: promptData.tripId,
      userId: promptData.userId,
      promptLength: promptData.prompt.length,
      generatedAt: promptData.generatedAt
    });
    
    return {
      success: true,
      tempStateId: `temp_${promptData.tripId}_${promptData.userId}_${Date.now()}`,
      message: "Prompt saved to temp state"
    };
    
  } catch (error) {
    console.error("❌ Failed to save prompt to temp state:", error);
    return {
      success: false,
      tempStateId: null,
      message: `Failed to save temp state: ${error.message}`
    };
  }
}

module.exports = {
  needSmartPromptService,
  getUserContext,
  savePromptToTempState
};
