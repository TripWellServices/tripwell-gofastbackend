/**
 * Profile Parser Service
 * Handles parsing and validation of GPT responses for profile content generation
 */

function parseProfileData(rawResponse) {
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

function validateProfileData(data) {
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

module.exports = {
  parseProfileData,
  validateProfileData
};
