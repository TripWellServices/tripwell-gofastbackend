const City = require("../../models/TripWell/City");

/**
 * ParseCityService - Parses city strings and manages city data
 * Can either save to City.js model or enhance TripBase.js
 */

/**
 * Parse a city string and return structured city data
 * @param {string} cityString - Raw city string (e.g., "Paris", "New York", "Tokyo, Japan")
 * @returns {Object} Parsed city data
 */
function parseCityString(cityString) {
  if (!cityString || typeof cityString !== 'string') {
    throw new Error('Invalid city string provided');
  }

  // Clean the input
  const cleanCity = cityString.trim();
  
  // Handle different formats
  let cityName, country;
  
  if (cleanCity.includes(',')) {
    // Format: "Paris, France" or "New York, USA"
    const parts = cleanCity.split(',').map(part => part.trim());
    cityName = parts[0];
    country = parts[1] || 'Unknown';
  } else {
    // Format: "Paris" or "New York"
    cityName = cleanCity;
    country = 'Unknown'; // Will need to be detected or provided
  }

  return {
    cityName,
    country,
    originalString: cityString,
    parsedAt: new Date()
  };
}

/**
 * Get or create a city in the City.js model
 * @param {string} cityString - Raw city string
 * @returns {Object} City document with _id
 */
async function getOrCreateCity(cityString) {
  try {
    const parsedCity = parseCityString(cityString);
    
    // Check if city already exists
    let cityDoc = await City.findOne({ cityName: parsedCity.cityName });
    
    if (cityDoc) {
      console.log(`✅ City found: ${parsedCity.cityName} (${cityDoc._id})`);
      return cityDoc;
    }
    
    // Create new city
    cityDoc = new City({
      cityName: parsedCity.cityName,
      country: parsedCity.country,
      status: 'active'
    });
    
    await cityDoc.save();
    console.log(`✅ City created: ${parsedCity.cityName} (${cityDoc._id})`);
    
    return cityDoc;
    
  } catch (error) {
    console.error('❌ Error in getOrCreateCity:', error);
    throw error;
  }
}

/**
 * Enhance TripBase with parsed city data
 * @param {Object} tripBase - TripBase document
 * @param {string} cityString - Raw city string
 * @returns {Object} Enhanced TripBase data
 */
function enhanceTripBaseWithCity(tripBase, cityString) {
  const parsedCity = parseCityString(cityString);
  
  return {
    ...tripBase.toObject(),
    cityData: {
      cityName: parsedCity.cityName,
      country: parsedCity.country,
      originalString: parsedCity.originalString,
      parsedAt: parsedCity.parsedAt
    }
  };
}

/**
 * Get city data for a TripBase document
 * @param {Object} tripBase - TripBase document
 * @returns {Object} City data
 */
async function getCityForTripBase(tripBase) {
  try {
    const cityDoc = await City.findOne({ cityName: tripBase.city });
    
    if (cityDoc) {
      return {
        cityId: cityDoc._id,
        cityName: cityDoc.cityName,
        country: cityDoc.country,
        status: cityDoc.status
      };
    }
    
    // If no city found, return parsed data
    const parsedCity = parseCityString(tripBase.city);
    return {
      cityId: null,
      cityName: parsedCity.cityName,
      country: parsedCity.country,
      status: 'not_saved'
    };
    
  } catch (error) {
    console.error('❌ Error in getCityForTripBase:', error);
    throw error;
  }
}

module.exports = {
  parseCityString,
  getOrCreateCity,
  enhanceTripBaseWithCity,
  getCityForTripBase
};
