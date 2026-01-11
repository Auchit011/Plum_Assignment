const ocrService = require('../services/ocrService');
const factorService = require('../services/factorService');
const scoring = require('../utils/scoring');
const recommend = require('../utils/recommend');

function isEmptyObject(obj) {
  return !obj || Object.keys(obj).length === 0;
}

exports.handleHealthAnalysis = async (req, res, next) => {
  const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  try {
    console.log(`[${requestId}] 🏥 Health Analysis Request Started`);
    
    // Step 1: Only accept image input
    if (!req.file) {
      console.log(`[${requestId}] ❌ Error: No image file provided`);
      return res.status(400).json({ 
        status: 'error', 
        reason: 'Image file required under field "image".' 
      });
    }

    console.log(`[${requestId}] 📸 Image received: ${req.file.originalname} (${req.file.size} bytes)`);

    // Step 2: Extract text using OCR
    console.log(`[${requestId}] 🔍 Starting OCR processing...`);
    const ocrResult = await ocrService.extractTextFromImage(req.file.path);
    const answers = ocrService.parseAnswersFromText(ocrResult.text);
    const confidence = ocrResult.confidence;
    
    console.log(`[${requestId}] ✅ OCR completed - Confidence: ${(confidence * 100).toFixed(1)}%`);
    console.log(`[${requestId}] 📋 Extracted answers:`, answers);

    // Step 3: Check for required fields and missing fields
    const requiredFields = ['age', 'smoker', 'exercise', 'diet'];
    const missingFields = requiredFields.filter((key) => 
      answers[key] === undefined || answers[key] === null || answers[key] === ''
    );

    console.log(`[${requestId}] 🔍 Field validation - Missing: ${missingFields.length}/${requiredFields.length}`);

    // Step 4: Check if >50% fields are missing
    const missingPercentage = (missingFields.length / requiredFields.length) * 100;
    
    if (missingPercentage > 50) {
      console.log(`[${requestId}] ⚠️ Incomplete profile - ${missingPercentage.toFixed(1)}% fields missing`);
      return res.json({
        "status": "incomplete_profile",
        "reason": ">50% fields missing"
      });
    }

    // Step 5: Return parsed data in specified format
    const parseResult = {
      "answers": answers,
      "missing_fields": missingFields,
      "confidence": confidence
    };

    console.log(`[${requestId}] ✅ Profile validation passed`);

    // Step 6: Extract factors and compute risk
    console.log(`[${requestId}] 🔍 Extracting health factors...`);
    const { factors } = factorService.extractFactors(answers);
    const { riskLevel, score, rationale } = scoring.classifyRisk(factors);
    
    console.log(`[${requestId}] 📊 Risk analysis - Level: ${riskLevel}, Score: ${score}`);
    console.log(`[${requestId}] 🎯 Identified factors:`, factors);

    // Step 7: Generate recommendations
    console.log(`[${requestId}] 💡 Generating recommendations...`);
    const recommendations = recommend.getRecommendations(factors);
    
    console.log(`[${requestId}] ✅ Analysis completed successfully`);
    console.log(`[${requestId}] 📤 Sending response - Risk: ${riskLevel}, Factors: ${factors.length}, Recommendations: ${recommendations.length}`);

    // Step 8: Return final comprehensive result
    return res.json({
      "risk_level": riskLevel,
      "factors": factors,
      "recommendations": recommendations,
      "status": "ok"
    });

  } catch (err) {
    console.error(`[${requestId}] ❌ Health Analysis Error:`, err.message);
    console.error(`[${requestId}] 📍 Error Stack:`, err.stack);
    next(err);
  }
};
