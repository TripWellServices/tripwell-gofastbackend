/**
 * City Data Parser Service
 * Handles parsing and validation of GPT responses for city data
 */

/**
 * Parses GPT response and validates structure
 * @param {string} rawResponse - Raw text response from GPT
 * @returns {Object} Parsed and validated city data
 */
const parseCityData = (rawResponse) => {
  try {
    // Parse JSON response safely
    const cityData = JSON.parse(rawResponse);
    
    // Validate required fields exist
    if (!cityData.city || !cityData.country || !cityData.currency_code) {
      throw new Error("Missing required fields: city, country, currency_code");
    }

    // Validate required arrays exist and are arrays
    if (!Array.isArray(cityData.pois)) {
      throw new Error("pois must be an array");
    }
    if (!Array.isArray(cityData.restaurants)) {
      throw new Error("restaurants must be an array");
    }
    if (!Array.isArray(cityData.transportation)) {
      throw new Error("transportation must be an array");
    }

    // Validate arrays are not empty
    if (cityData.pois.length === 0) {
      throw new Error("pois array cannot be empty");
    }
    if (cityData.restaurants.length === 0) {
      throw new Error("restaurants array cannot be empty");
    }
    if (cityData.transportation.length === 0) {
      throw new Error("transportation array cannot be empty");
    }

    return {
      success: true,
      data: cityData
    };

  } catch (parseError) {
    console.error("Failed to parse GPT response:", parseError);
    return {
      success: false,
      error: parseError.message || "Invalid JSON response from GPT"
    };
  }
};

/**
 * Validates city data structure before saving
 * @param {Object} cityData - Parsed city data object
 * @returns {Object} Validation result
 */
const validateCityData = (cityData) => {
  try {
    // Check if all required arrays have valid items
    const validationErrors = [];

    // Validate POIs
    cityData.pois.forEach((poi, index) => {
      if (!poi.name) {
        validationErrors.push(`POI at index ${index} missing name`);
      }
    });

    // Validate Restaurants
    cityData.restaurants.forEach((restaurant, index) => {
      if (!restaurant.name) {
        validationErrors.push(`Restaurant at index ${index} missing name`);
      }
    });

    // Validate Transportation
    cityData.transportation.forEach((transport, index) => {
      if (!transport.name) {
        validationErrors.push(`Transportation at index ${index} missing name`);
      }
    });

    if (validationErrors.length > 0) {
      return {
        success: false,
        error: `Validation errors: ${validationErrors.join(', ')}`
      };
    }

    return {
      success: true,
      data: cityData
    };

  } catch (error) {
    return {
      success: false,
      error: error.message || "Validation failed"
    };
  }
};

module.exports = {
  parseCityData,
  validateCityData
};
