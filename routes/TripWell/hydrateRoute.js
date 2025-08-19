const express = require("express");
const router = express.Router();
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");
const tripExtraService = require("../../services/TripWell/tripExtra");

// 🔐 GET /tripwell/hydrate
// Description: Returns all localStorage data for the authenticated user
// This is a one-stop shop for frontend localStorage hydration
router.get("/hydrate", verifyFirebaseToken, async (req, res) => {
  try {
    console.log("🔄 GET /tripwell/hydrate - Flushing all data for localStorage");
    const firebaseId = req.user.uid;
    
    // First try to get data from backend
    const localStorageData = await tripExtraService.getLocalStorageData(firebaseId);
    
    if (localStorageData.error) {
      return res.status(404).json({ error: localStorageData.error });
    }

    // Validate the data we got
    let validation;
    if (localStorageData.tripData) {
      // Backend flow - validate against database
      validation = await tripExtraService.validateUserData(firebaseId);
    } else {
      // Frontend-only flow - validate against localStorage data
      validation = await tripExtraService.validateFrontendFlow(firebaseId, localStorageData);
    }

    // Add validation info to response for debugging
    const response = {
      ...localStorageData,
      validation: {
        isValid: validation.isValid,
        missingData: validation.missingData,
        summary: validation.summary,
        flow: validation.flow || "unknown"
      }
    };

    console.log("✅ LocalStorage flush complete:", {
      hasUserData: !!localStorageData.userData,
      hasTripData: !!localStorageData.tripData,
      hasTripIntentData: !!localStorageData.tripIntentData,
      hasAnchorSelectData: !!localStorageData.anchorSelectData,
      hasItineraryData: !!localStorageData.itineraryData,
      validation: validation.summary,
      flow: validation.flow
    });

    res.set("Cache-Control", "no-store");
    return res.json(response);

  } catch (err) {
    console.error("❌ LocalStorage flush failed:", err);
    return res.status(500).json({ error: "Failed to flush localStorage data" });
  }
});

// 🔍 GET /tripwell/hydrate/validate
// Description: Just validate what data is missing (for debugging)
router.get("/hydrate/validate", verifyFirebaseToken, async (req, res) => {
  try {
    console.log("🔍 GET /tripwell/hydrate/validate - Checking data completeness");
    const firebaseId = req.user.uid;
    
    const validation = await tripExtraService.validateUserData(firebaseId);
    
    res.json({
      firebaseId,
      validation
    });

  } catch (err) {
    console.error("❌ Validation check failed:", err);
    return res.status(500).json({ error: "Failed to validate data" });
  }
});

// 🔍 GET /tripwell/hydrate/validate-frontend
// Description: Validate frontend localStorage data (for frontend-only flow)
router.post("/hydrate/validate-frontend", verifyFirebaseToken, async (req, res) => {
  try {
    console.log("🔍 POST /tripwell/hydrate/validate-frontend - Validating frontend data");
    const firebaseId = req.user.uid;
    const localStorageData = req.body;
    
    const validation = await tripExtraService.validateFrontendFlow(firebaseId, localStorageData);
    
    res.json({
      firebaseId,
      validation
    });

  } catch (err) {
    console.error("❌ Frontend validation check failed:", err);
    return res.status(500).json({ error: "Failed to validate frontend data" });
  }
});

module.exports = router;
