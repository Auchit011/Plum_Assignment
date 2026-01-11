exports.extractFactors = (answers) => {
  try {
    console.log(`🔍 Factor Service: Starting factor extraction`);
    console.log(`📋 Factor Service: Input answers:`, answers);
    
    const factors = [];
    let signals = 0;

    // Check smoking
    if (typeof answers.smoker !== 'undefined') {
      if (answers.smoker === true || String(answers.smoker).toLowerCase().startsWith('y')) {
        factors.push('smoking');
        console.log(`✅ Factor Service: Smoking factor identified`);
      } else {
        console.log(`ℹ️ Factor Service: Non-smoker detected`);
      }
      signals += 1;
    } else {
      console.log(`⚠️ Factor Service: Smoking status not available`);
    }

    // Check diet
    if (typeof answers.diet !== 'undefined') {
      const diet = String(answers.diet).toLowerCase();
      if (diet.includes('high sugar') || diet.includes('poor') || diet.includes('bad')) {
        factors.push('poor diet');
        console.log(`✅ Factor Service: Poor diet factor identified`);
      } else {
        console.log(`ℹ️ Factor Service: Healthy diet detected`);
      }
      signals += 1;
    } else {
      console.log(`⚠️ Factor Service: Diet information not available`);
    }

    // Check exercise
    if (typeof answers.exercise !== 'undefined') {
      const exercise = String(answers.exercise).toLowerCase();
      if (exercise.includes('rarely') || exercise.includes('low') || exercise.includes('none')) {
        factors.push('low exercise');
        console.log(`✅ Factor Service: Low exercise factor identified`);
      } else {
        console.log(`ℹ️ Factor Service: Active lifestyle detected`);
      }
      signals += 1;
    } else {
      console.log(`⚠️ Factor Service: Exercise level not available`);
    }

    // Check age
    if (typeof answers.age !== 'undefined') {
      const age = parseInt(answers.age);
      if (!isNaN(age) && age >= 65) {
        factors.push('age');
        console.log(`✅ Factor Service: Age factor identified (65+)`);
      } else {
        console.log(`ℹ️ Factor Service: Age under 65`);
      }
      signals += 1;
    } else {
      console.log(`⚠️ Factor Service: Age information not available`);
    }

    const confidence = signals > 0 ? Math.min(1, 0.6 + factors.length * 0.1) : 0.5;
    
    console.log(`✅ Factor Service: Extraction completed`);
    console.log(`📊 Factor Service: Identified factors: ${factors.length}`);
    console.log(`🎯 Factor Service: Factors:`, factors);
    console.log(`📈 Factor Service: Confidence: ${(confidence * 100).toFixed(1)}%`);
    
    return { factors, confidence };
  } catch (error) {
    console.error(`❌ Factor Service: Factor extraction failed:`, error.message);
    return { factors: [], confidence: 0.5 };
  }
};


