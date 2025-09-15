const mongoose = require('mongoose');

/**
 * Place Todo Parse & Save Service
 * Handles parsing GPT responses and saving place todo data to the database
 */

// Parse functions
function parsePlaceTodoData(rawResponse) {
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
      // Look for JSON object in the response
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
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

function validatePlaceTodoData(data) {
  try {
    // Check if data is an object
    if (typeof data !== 'object' || data === null) {
      return {
        success: false,
        error: "Data must be an object"
      };
    }

    // Check required arrays
    const requiredArrays = ['attractions', 'restaurants', 'mustSee', 'mustDo'];
    for (const arrayName of requiredArrays) {
      if (!Array.isArray(data[arrayName])) {
        return {
          success: false,
          error: `Missing or invalid array: ${arrayName}`
        };
      }
    }

    // Validate each array has content
    for (const arrayName of requiredArrays) {
      if (data[arrayName].length === 0) {
        return {
          success: false,
          error: `Array ${arrayName} is empty`
        };
      }
    }

    // Validate attraction structure
    for (const attraction of data.attractions) {
      if (!attraction.name || !attraction.description || !attraction.location) {
        return {
          success: false,
          error: "Attraction missing required fields: name, description, location"
        };
      }
    }

    // Validate restaurant structure
    for (const restaurant of data.restaurants) {
      if (!restaurant.name || !restaurant.description || !restaurant.location) {
        return {
          success: false,
          error: "Restaurant missing required fields: name, description, location"
        };
      }
    }

    // Validate mustSee structure
    for (const mustSee of data.mustSee) {
      if (!mustSee.name || !mustSee.description || !mustSee.location) {
        return {
          success: false,
          error: "MustSee missing required fields: name, description, location"
        };
      }
    }

    // Validate mustDo structure
    for (const mustDo of data.mustDo) {
      if (!mustDo.name || !mustDo.description || !mustDo.location) {
        return {
          success: false,
          error: "MustDo missing required fields: name, description, location"
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

// Place Todo Schema (you may need to adjust this based on your existing models)
const PlaceTodoSchema = new mongoose.Schema({
  profileSlug: { type: String, required: true, unique: true },
  city: { type: String, required: true },
  season: { type: String, required: true },
  purpose: { type: String },
  whoWith: { type: String, required: true },
  priorities: [String],
  vibes: [String],
  mobility: [String],
  travelPace: [String],
  budget: { type: String },
  attractions: [{
    name: String,
    description: String,
    location: String,
    cost: String,
    whyChose: String
  }],
  restaurants: [{
    name: String,
    description: String,
    location: String,
    priceRange: String,
    whyChose: String
  }],
  mustSee: [{
    name: String,
    description: String,
    location: String,
    cost: String,
    whyChose: String
  }],
  mustDo: [{
    name: String,
    description: String,
    location: String,
    cost: String,
    whyChose: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Use existing connection or create model
let PlaceTodo;
try {
  PlaceTodo = mongoose.model('PlaceTodo');
} catch (error) {
  PlaceTodo = mongoose.model('PlaceTodo', PlaceTodoSchema);
}

async function savePlaceTodoData({ profileSlug, inputVariables, parsedData }) {
  try {
    console.log("💾 Saving place todo data for profile:", profileSlug);

    // Prepare the document
    const placeTodoDoc = {
      profileSlug: profileSlug,
      city: inputVariables.city,
      season: inputVariables.season,
      purpose: inputVariables.purpose,
      whoWith: inputVariables.whoWith,
      priorities: inputVariables.priorities || [],
      vibes: inputVariables.vibes || [],
      mobility: inputVariables.mobility || [],
      travelPace: inputVariables.travelPace || [],
      budget: inputVariables.budget,
      attractions: parsedData.attractions || [],
      restaurants: parsedData.restaurants || [],
      mustSee: parsedData.mustSee || [],
      mustDo: parsedData.mustDo || [],
      updatedAt: new Date()
    };

    // Use upsert to update existing or create new
    const result = await PlaceTodo.findOneAndUpdate(
      { profileSlug: profileSlug },
      placeTodoDoc,
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true
      }
    );

    console.log("✅ Place todo data saved successfully:", result._id);

    return {
      success: true,
      placeTodoId: result._id,
      profileSlug: profileSlug,
      message: "Place todo data saved successfully"
    };

  } catch (error) {
    console.error("❌ Failed to save place todo data:", error);
    throw new Error(`Failed to save place todo data: ${error.message}`);
  }
}

async function getPlaceTodoBySlug(profileSlug) {
  try {
    const placeTodo = await PlaceTodo.findOne({ profileSlug: profileSlug });
    return placeTodo;
  } catch (error) {
    console.error("❌ Failed to get place todo:", error);
    throw new Error(`Failed to get place todo: ${error.message}`);
  }
}

async function getAllPlaceTodos() {
  try {
    const placeTodos = await PlaceTodo.find({}).sort({ createdAt: -1 });
    return placeTodos;
  } catch (error) {
    console.error("❌ Failed to get all place todos:", error);
    throw new Error(`Failed to get all place todos: ${error.message}`);
  }
}

module.exports = {
  savePlaceTodoData,
  getPlaceTodoBySlug,
  getAllPlaceTodos
};
