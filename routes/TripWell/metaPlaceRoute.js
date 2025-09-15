const express = require("express");
const router = express.Router();
const { generateMetaPlace } = require("../../services/TripWell/metaPlaceService");
const { generateEnhancedPlaceTodo } = require("../../services/TripWell/enhancedPlaceTodoService");
const { parsePlaceTodoData, validatePlaceTodoData, savePlaceTodoData } = require("../../services/TripWell/placetodoSaveService");

/**
 * MetaPlace Route - Orchestrates the MetaPlace → Enhanced Content flow
 * 1. Generate MetaPlace foundation
 * 2. Use MetaPlace to generate enhanced content for each section
 * 3. Parse, validate, and save everything
 */

router.post("/meta-place-gpt", async (req, res) => {
  const { placeSlug, inputVariables } = req.body;
  
  try {
    console.log('🚀 Starting MetaPlace generation for:', placeSlug);
    
    // Step 1: Generate MetaPlace foundation
    console.log('📋 Step 1: Generating MetaPlace foundation...');
    const metaPlaceResult = await generateMetaPlace({ placeSlug, inputVariables });
    
    // Parse MetaPlace data
    let metaPlaceData;
    try {
      metaPlaceData = JSON.parse(metaPlaceResult.rawResponse);
      console.log('✅ MetaPlace foundation generated successfully');
    } catch (parseError) {
      console.error('❌ Failed to parse MetaPlace data:', parseError);
      throw new Error(`Failed to parse MetaPlace data: ${parseError.message}`);
    }
    
    // Step 2: Generate enhanced content for each section
    console.log('🎯 Step 2: Generating enhanced content sections...');
    
    const sections = ['attractions', 'restaurants', 'mustSee', 'mustDo'];
    const enhancedContent = {};
    
    for (const section of sections) {
      console.log(`  📝 Generating ${section}...`);
      try {
        const sectionResult = await generateEnhancedPlaceTodo({ 
          placeSlug, 
          inputVariables, 
          metaPlaceData, 
          section 
        });
        
        // Parse section data
        const sectionData = JSON.parse(sectionResult.rawResponse);
        enhancedContent[section] = sectionData;
        console.log(`  ✅ ${section} generated successfully`);
        
      } catch (sectionError) {
        console.error(`  ❌ Failed to generate ${section}:`, sectionError);
        throw new Error(`Failed to generate ${section}: ${sectionError.message}`);
      }
    }
    
    // Step 3: Combine MetaPlace + Enhanced Content
    console.log('🔗 Step 3: Combining MetaPlace + Enhanced Content...');
    
    const combinedData = {
      attractions: enhancedContent.attractions,
      restaurants: enhancedContent.restaurants,
      mustSee: enhancedContent.mustSee,
      mustDo: enhancedContent.mustDo
    };
    
    // Step 4: Parse, validate, and save
    console.log('💾 Step 4: Parsing, validating, and saving...');
    
    const parseResult = parsePlaceTodoData(JSON.stringify(combinedData));
    if (!parseResult.success) {
      throw new Error(`Failed to parse combined data: ${parseResult.error}`);
    }
    
    const validationResult = validatePlaceTodoData(parseResult.data);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error}`);
    }
    
    const saveResult = await savePlaceTodoData({ 
      placeSlug, 
      inputVariables, 
      parsedData: validationResult.data 
    });
    
    console.log('🎉 MetaPlace generation completed successfully!');
    
    res.status(200).json({ 
      status: "success", 
      message: "MetaPlace and enhanced content generated successfully", 
      placeSlug: placeSlug,
      placeTodoId: saveResult.placeTodoId,
      metaPlaceData: metaPlaceData,
      sectionsGenerated: sections.length
    });
    
  } catch (error) {
    console.error('❌ MetaPlace generation failed:', error);
    res.status(500).json({ 
      status: "error", 
      message: "Failed to generate MetaPlace and enhanced content", 
      error: error.message 
    });
  }
});

module.exports = router;
