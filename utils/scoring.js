const SCORE_MAP = {
  'smoking': 30,
  'poor diet': 20,
  'low exercise': 28,
  'age': 15,
};

function computeScore(factors) {
  return factors.reduce((acc, f) => acc + (SCORE_MAP[f] || 0), 0);
}

function toRiskLevel(score) {
  if (score <= 40) return 'low';
  if (score <= 70) return 'medium';
  return 'high';
}

exports.classifyRisk = (factors) => {
  try {
    console.log(`🔍 Scoring: Starting risk classification`);
    console.log(`📋 Scoring: Input factors:`, factors);
    
    const score = computeScore(factors);
    const riskLevel = toRiskLevel(score);
    const rationale = factors.map((f) => {
      switch(f) {
        case 'smoking': return 'smoking';
        case 'poor diet': return 'high sugar diet';
        case 'low exercise': return 'low activity';
        case 'age': return 'age';
        default: return f;
      }
    });
    
    console.log(`✅ Scoring: Risk classification completed`);
    console.log(`📊 Scoring: Risk Level: ${riskLevel}`);
    console.log(`📈 Scoring: Score: ${score} points`);
    console.log(`🎯 Scoring: Rationale:`, rationale);
    
    return { riskLevel, score, rationale };
  } catch (error) {
    console.error(`❌ Scoring: Risk classification failed:`, error.message);
    return { riskLevel: 'low', score: 0, rationale: [] };
  }
};

exports._internal = { SCORE_MAP, computeScore, toRiskLevel };


