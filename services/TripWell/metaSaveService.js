const mongoose = require("mongoose");
const MetaAttractions = require("../../models/TripWell/MetaAttractions");
const City = require("../../models/TripWell/City");
const { getOrCreateCity } = require("./parseCityService");

async function saveParsedMetaAttractions({ tripId, userId, city, season, selectedMetas }) {
  if (!tripId || !userId) throw new Error("Missing tripId or userId");
  if (!city || !season) throw new Error("Missing city or season");
  if (!Array.isArray(selectedMetas) || selectedMetas.length === 0) {
    throw new Error("Selected metas must be a non-empty array");
  }

  const tripObjectId = new mongoose.Types.ObjectId(tripId);

  // 🔍 Step 1: Get or create city
  const cityDoc = await getOrCreateCity(city);
  console.log("✅ City ready for meta save:", cityDoc.cityName, cityDoc._id);

  // 🔍 Step 2: Find existing meta attractions for this city/season
  let metaAttractions = await MetaAttractions.findOne({ 
    cityId: cityDoc._id, 
    season 
  });

  if (!metaAttractions) {
    throw new Error("Meta attractions not found for this city/season. Run meta-attractions first.");
  }

  // 🔍 Step 3: Filter meta attractions to only include selected ones
  const selectedMetaData = metaAttractions.metaAttractions.filter(meta => 
    selectedMetas.includes(meta.name)
  );

  if (selectedMetaData.length === 0) {
    throw new Error("No matching meta attractions found for selected metas");
  }

  // 💾 Step 4: Save selected metas to a new collection or update existing
  const metaSaveRecord = await MetaAttractions.create({
    tripId: tripObjectId,
    userId,
    cityId: cityDoc._id,
    cityName: city,
    season,
    selectedMetas: selectedMetaData,
    metaAttractions: metaAttractions.metaAttractions, // Keep full list for reference
    status: 'selected'
  });

  console.log("✅ Meta attractions saved for trip:", tripId, "Selected:", selectedMetaData.length);

  return {
    selectedMetaData,
    metaSaveRecord,
    totalAvailable: metaAttractions.metaAttractions.length,
    selectedCount: selectedMetaData.length
  };
}

module.exports = { saveParsedMetaAttractions };
