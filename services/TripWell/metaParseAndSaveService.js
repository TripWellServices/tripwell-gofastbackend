const mongoose = require('mongoose');

/**
 * Meta Parse & Save Service
 * Handles parsing GPT responses for meta attractions and saving to database
 * Follows the same pattern as placetodoSaveService.js
 */

// Parse functions
function parseMetaAttractionsData(rawResponse) {
  try {
    // Try to parse as JSON
    const data = JSON.parse(rawResponse);
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    // If JSON parsing fails, try to extract JSON from markdown or other formats
    try {
      // Look for JSON array in the response
      const jsonMatch = rawResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          data: data
        };
      }
    } catch (secondError) {
      // If all parsing attempts fail
      return {
        success: false,
        error: `Failed to parse JSON: ${error.message}`
      };
    }
    
    return {
      success: false,
      error: `Failed to parse JSON: ${error.message}`
    };
  }
}

function validateMetaAttractionsData(data) {
  try {
    // Check if data is an array
    if (!Array.isArray(data)) {
      return {
        success: false,
        error: "Meta attractions data must be an array"
      };
    }
    
    // Check if array has items
    if (data.length === 0) {
      return {
        success: false,
        error: "Meta attractions array cannot be empty"
      };
    }
    
    // Validate each attraction object
    for (let i = 0; i < data.length; i++) {
      const attraction = data[i];
      
      if (!attraction.name || typeof attraction.name !== 'string') {
        return {
          success: false,
          error: `Attraction ${i} missing or invalid name`
        };
      }
      
      if (!attraction.type || typeof attraction.type !== 'string') {
        return {
          success: false,
          error: `Attraction ${i} missing or invalid type`
        };
      }
      
      if (!attraction.reason || typeof attraction.reason !== 'string') {
        return {
          success: false,
          error: `Attraction ${i} missing or invalid reason`
        };
      }
    }
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    return {
      success: false,
      error: `Validation error: ${error.message}`
    };
  }
}

// Meta Attractions Schema
const MetaAttractionsSchema = new mongoose.Schema({
  placeSlug: { type: String, required: true, unique: true },
  city: { type: String, required: true },
  season: { type: String, required: true },
  metaAttractions: [{
    name: String,
    type: String,
    reason: String
  }],
  status: { type: String, default: 'meta_generated' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Use existing connection or create model
let MetaAttractions;
try {
  MetaAttractions = mongoose.model('MetaAttractions');
} catch (error) {
  MetaAttractions = mongoose.model('MetaAttractions', MetaAttractionsSchema);
}

async function saveMetaAttractionsData({ placeSlug, city, season, metaAttractions }) {
  try {
    console.log("💾 Saving meta attractions to database...");
    
    const newMetaAttractions = new MetaAttractions({
      placeSlug,
      city,
      season,
      metaAttractions,
      status: 'meta_generated'
    });

    await newMetaAttractions.save();
    console.log("✅ Meta attractions saved:", newMetaAttractions._id);
    
    return {
      success: true,
      metaAttractionsId: newMetaAttractions._id,
      message: "Meta attractions saved successfully"
    };
  } catch (error) {
    console.error("❌ Failed to save meta attractions:", error);
    return {
      success: false,
      error: `Failed to save meta attractions: ${error.message}`
    };
  }
}

// Main function that combines parse, validate, and save
async function parseAndSaveMetaAttractions({ placeSlug, city, season, rawResponse }) {
  try {
    console.log("🔄 Starting meta attractions parse and save...");
    
    // Step 1: Parse the GPT response
    const parseResult = parseMetaAttractionsData(rawResponse);
    if (!parseResult.success) {
      throw new Error(`Failed to parse meta attractions: ${parseResult.error}`);
    }
    console.log("✅ Meta attractions parsed:", parseResult.data.length, "attractions");
    
    // Step 2: Validate the parsed data
    const validationResult = validateMetaAttractionsData(parseResult.data);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error}`);
    }
    console.log("✅ Meta attractions validated");
    
    // Step 3: Save to database
    const saveResult = await saveMetaAttractionsData({
      placeSlug,
      city,
      season,
      metaAttractions: validationResult.data
    });
    
    if (!saveResult.success) {
      throw new Error(`Save failed: ${saveResult.error}`);
    }
    console.log("✅ Meta attractions saved successfully");
    
    return {
      success: true,
      metaAttractionsId: saveResult.metaAttractionsId,
      metaAttractions: validationResult.data,
      message: "Meta attractions generated and saved successfully"
    };
    
  } catch (error) {
    console.error("❌ Meta attractions parse and save failed:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  parseMetaAttractionsData,
  validateMetaAttractionsData,
  saveMetaAttractionsData,
  parseAndSaveMetaAttractions
};
