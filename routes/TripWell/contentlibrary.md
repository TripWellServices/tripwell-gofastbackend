# TripWell Content Library Routes

This folder contains all TripWell-related API routes. Each route file handles specific functionality for the TripWell travel planning platform.

## City Data Routes (Modular Architecture)

### cityDataGPTRoute.js
- **Endpoint**: `POST /Tripwell/city-data-gpt`
- **Purpose**: Calls GPT to get city travel data
- **Input**: `{ city: "Paris", country: "France", currency_code: "EUR" }`
- **Action**: Calls GPT with Angela prompt
- **Response**: `{ status: "ok", city: "Paris", rawResponse: "..." }`

### cityDataParserRoute.js
- **Endpoint**: `POST /Tripwell/city-data-parser`
- **Purpose**: Parses and validates GPT response
- **Input**: `{ rawResponse: "..." }`
- **Action**: 
  - Parses JSON response safely
  - Validates required arrays and structure
  - Returns clean city data
- **Response**: `{ status: "ok", cityData: {...} }`

### cityDataCallRoute.js
- **Endpoint**: `POST /Tripwell/city-data`
- **Purpose**: Saves parsed city data to content library
- **Input**: `{ city: "Paris", cityData: {...} }`
- **Action**: 
  - Saves to `Tripwell_content_library` database in collections:
    - `pois` (Points of Interest)
    - `restaurants` 
    - `transportation`
- **Response**: `{ status: "ok", city: "Paris", counts: { pois: X, restaurants: Y, transportation: Z } }`
- **Database**: Uses `Tripwell_content_library` (separate from main `GoFastFamily` DB)

## Services

### cityDataParserService.js
- **Location**: `services/TripWell/`
- **Purpose**: Handles parsing and validation logic
- **Functions**: `parseCityData()`, `validateCityData()`

## Other TripWell Routes

*[Add other route descriptions as needed]*

## Database Structure

### Tripwell_content_library
Collections:
- `pois` - Points of interest with citySlug, createdAt
- `restaurants` - Restaurant data with citySlug, createdAt  
- `transportation` - Transportation options with citySlug, createdAt

All documents include:
- `citySlug`: slugified city name
- `createdAt`: timestamp

## Usage Notes

- Routes use existing mongoose connection but switch to content library DB
- OpenAI integration via existing config
- Error handling returns `{ status: "error", message }` format
