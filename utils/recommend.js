const RECOMMENDATIONS = {
  'smoking': 'Quit smoking',
  'poor diet': 'Reduce sugar',
  'low exercise': 'Walk 30 mins daily',
  'age': 'Regular health checkups and monitoring',
};

exports.getRecommendations = (factors) => {
  try {
    console.log(`🔍 Recommendations: Starting recommendation generation`);
    console.log(`📋 Recommendations: Input factors:`, factors);
    
    const recommendations = factors.map((f) => RECOMMENDATIONS[f] || 'Maintain healthy lifestyle');
    
    console.log(`✅ Recommendations: Generation completed`);
    console.log(`💡 Recommendations: Generated ${recommendations.length} recommendations`);
    console.log(`📝 Recommendations:`, recommendations);
    
    return recommendations;
  } catch (error) {
    console.error(`❌ Recommendations: Generation failed:`, error.message);
    return ['Maintain healthy lifestyle'];
  }
};

exports._internal = { RECOMMENDATIONS };


