const Tesseract = require('tesseract.js');
const fs = require('fs');

exports.extractTextFromImage = async (imagePath) => {
  try {
    console.log(`🔍 OCR: Starting text extraction from ${imagePath}`);
    
    // Enhanced OCR settings for handwritten text
    const { data } = await Tesseract.recognize(imagePath, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text') {
          console.log(`🔄 OCR: Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
      // Enhanced settings for handwritten text
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789:->- ',
      tessedit_pageseg_mode: '6', // Assume uniform block of text
      tessedit_ocr_engine_mode: '3', // Default, based on what is available
      // Additional settings for better handwritten text recognition
      preserve_interword_spaces: '1',
      textord_min_linesize: '2.5',
      textord_min_xheight: '10'
    });
    
    const text = data.text || '';
    const confidence = Array.isArray(data.words) && data.words.length > 0
      ? data.words.reduce((acc, w) => acc + (w.confidence || 0), 0) / data.words.length / 100
      : (data.confidence ? data.confidence / 100 : 0.7);
    
    console.log(`✅ OCR: Text extracted successfully`);
    console.log(`📊 OCR: Confidence: ${(confidence * 100).toFixed(1)}%`);
    console.log(`📝 OCR: Extracted text length: ${text.length} characters`);
    console.log(`📄 OCR: Raw extracted text: "${text}"`);
    
    // If confidence is very low, try alternative parsing
    if (confidence < 0.3) {
      console.log(`⚠️ OCR: Low confidence detected, attempting text cleanup...`);
      
      // Clean up common OCR errors for handwritten text
      let cleanedText = text
        .replace(/[|]/g, 'I') // Replace | with I
        .replace(/[0O]/g, 'O') // Replace 0 with O where appropriate
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
      
      console.log(`🔧 OCR: Cleaned text: "${cleanedText}"`);
      
      // cleanup temp file
      try { 
        fs.unlinkSync(imagePath); 
        console.log(`🗑️ OCR: Temp file cleaned up`);
      } catch (cleanupErr) {
        console.warn(`⚠️ OCR: Failed to cleanup temp file:`, cleanupErr.message);
      }
      
      return { text: cleanedText, confidence: Math.max(confidence, 0.3) };
    }
    
    // cleanup temp file
    try { 
      fs.unlinkSync(imagePath); 
      console.log(`🗑️ OCR: Temp file cleaned up`);
    } catch (cleanupErr) {
      console.warn(`⚠️ OCR: Failed to cleanup temp file:`, cleanupErr.message);
    }
    
    return { text, confidence };
  } catch (error) {
    console.error(`❌ OCR: Text extraction failed:`, error.message);
    throw error;
  }
};

exports.parseAnswersFromText = (text) => {
  try {
    console.log(`🔍 Parser: Starting text parsing`);
    console.log(`📝 Parser: Input text length: ${text.length} characters`);
    console.log(`📄 Parser: Raw text: "${text}"`);
    
    const lower = (text || '').toLowerCase();
    const answers = {};
    
    // Enhanced age extraction - handle various formats
    const agePatterns = [
      /(?:age|aged?)\s*[:\-]\s*(\d+)/,
      /age\s*(\d+)/,
      /(\d+)\s*years?/,
      /(\d+)\s*yo/
    ];
    
    let ageFound = false;
    for (const pattern of agePatterns) {
      const match = lower.match(pattern);
      if (match) {
        answers.age = parseInt(match[1]);
        console.log(`✅ Parser: Age extracted: ${answers.age}`);
        ageFound = true;
        break;
      }
    }
    if (!ageFound) {
      console.log(`⚠️ Parser: Age not found in text`);
    }
    
    // Enhanced smoking detection - handle misspellings and various formats
    const smokingPatterns = [
      /smoke[er]?\s*[:\-]\s*(yes|no|y|n)/i,
      /smoke[er]?\s*[:\-]\s*(true|false)/i,
      /smoke[er]?\s*[:\-]\s*(smoker|non.?smoker)/i,
      /(?:smoke[er]?|smok)\s*[:\-]\s*(yes|no|y|n)/i,
      /(?:smoke[er]?|smok)\s*[:\-]\s*(true|false)/i
    ];
    
    let smokingFound = false;
    for (const pattern of smokingPatterns) {
      const match = lower.match(pattern);
      if (match) {
        const value = match[1].toLowerCase();
        answers.smoker = /yes|y|true|smoker/.test(value);
        console.log(`✅ Parser: Smoking status extracted: ${answers.smoker}`);
        smokingFound = true;
        break;
      }
    }
    if (!smokingFound) {
      console.log(`⚠️ Parser: Smoking status not found in text`);
    }
    
    // Enhanced exercise detection - handle various formats
    const exercisePatterns = [
      /exercise\s*[:\-]\s*(low|moderate|high|rarely|regular|frequent)/i,
      /exercise\s*[:\-]\s*(sedentary|active|very.?active)/i,
      /activity\s*[:\-]\s*(low|moderate|high|rarely|regular|frequent)/i
    ];
    
    let exerciseFound = false;
    for (const pattern of exercisePatterns) {
      const match = lower.match(pattern);
      if (match) {
        const value = match[1].toLowerCase();
        if (/low|rarely|sedentary|none/.test(value)) {
          answers.exercise = 'rarely';
        } else if (/moderate|regular/.test(value)) {
          answers.exercise = 'moderate';
        } else if (/high|frequent|active|very.?active/.test(value)) {
          answers.exercise = 'high';
        } else {
          answers.exercise = 'moderate';
        }
        console.log(`✅ Parser: Exercise level extracted: ${answers.exercise}`);
        exerciseFound = true;
        break;
      }
    }
    if (!exerciseFound) {
      console.log(`⚠️ Parser: Exercise level not found in text`);
    }
    
    // Enhanced diet detection - handle various formats
    const dietPatterns = [
      /diet\s*[:\-]\s*(high.?sugar|poor|bad|junk|unhealthy|balanced|healthy|good)/i,
      /diet\s*[:\-]\s*(sugar|sweet|processed|natural|organic)/i,
      /food\s*[:\-]\s*(high.?sugar|poor|bad|junk|unhealthy|balanced|healthy|good)/i
    ];
    
    let dietFound = false;
    for (const pattern of dietPatterns) {
      const match = lower.match(pattern);
      if (match) {
        const value = match[1].toLowerCase();
        if (/high.?sugar|poor|bad|junk|unhealthy|sugar|sweet|processed/.test(value)) {
          answers.diet = 'high sugar';
        } else {
          answers.diet = 'balanced';
        }
        console.log(`✅ Parser: Diet extracted: ${answers.diet}`);
        dietFound = true;
        break;
      }
    }
    if (!dietFound) {
      console.log(`⚠️ Parser: Diet information not found in text`);
    }
    
    console.log(`✅ Parser: Parsing completed successfully`);
    console.log(`📋 Parser: Final answers:`, answers);
    
    return answers;
  } catch (error) {
    console.error(`❌ Parser: Text parsing failed:`, error.message);
    return {};
  }
};


