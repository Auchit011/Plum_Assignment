
const express = require('express');
const healthAnalysisController = require('../controllers/healthAnalysisController');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'AI-Powered Health Risk Profiler',
    endpoint: '/health-analysis',
    method: 'POST',
    description: 'Upload an image with health data to get complete analysis'
  });
});

// POST /health-analysis - Single endpoint that does everything (image only)
router.post('/health-analysis', (req, res, next) => {
  const upload = req.upload;
  if (!upload) return next(new Error('Upload middleware not initialized'));
  const single = upload.single('image');
  single(req, res, (err) => {
    if (err) return next(err);
    healthAnalysisController.handleHealthAnalysis(req, res, next);
  });
});

// POST /parse - Accept either JSON answers or raw text
router.post('/parse', (req, res) => {
  try {
    // If JSON body already contains answers, validate and return
    if (req.is('application/json') && Object.keys(req.body || {}).length > 0 && (req.body.age || req.body.smoker || req.body.exercise || req.body.diet)) {
      const answers = req.body;
      const requiredFields = ['age','smoker','exercise','diet'];
      const missingFields = requiredFields.filter((k) => answers[k] === undefined || answers[k] === null || answers[k] === '');
      return res.json({ answers, missing_fields: missingFields, confidence: 0.99 });
    }

    // Otherwise expect raw text in { text: "..." } or text/plain
    const rawText = (req.body && req.body.text) || req.text || '';
    if (!rawText || rawText.trim().length === 0) return res.status(400).json({ status: 'error', reason: 'No input provided' });

    const answers = healthAnalysisController ? require('../services/ocrService').parseAnswersFromText(rawText) : {};
    const requiredFields = ['age','smoker','exercise','diet'];
    const missingFields = requiredFields.filter((k) => answers[k] === undefined || answers[k] === null || answers[k] === '');

    return res.json({ answers, missing_fields: missingFields, confidence: 0.95 });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /extract-factors - Convert answers to factors
router.post('/extract-factors', (req, res) => {
  try {
    const answers = req.body;
    if (!answers || Object.keys(answers).length === 0) return res.status(400).json({ status: 'error', reason: 'Answers required as JSON body' });
    const { factors, confidence } = require('../services/factorService').extractFactors(answers);
    return res.json({ factors, confidence });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /classify-risk - Classify risk from factors
router.post('/classify-risk', (req, res) => {
  try {
    const { factors } = req.body || {};
    if (!Array.isArray(factors)) return res.status(400).json({ status: 'error', reason: 'factors must be an array' });
    const result = require('../utils/scoring').classifyRisk(factors);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /recommendations - Generate recommendations from factors
router.post('/recommendations', (req, res) => {
  try {
    const { factors, risk_level } = req.body || {};
    if (!Array.isArray(factors)) return res.status(400).json({ status: 'error', reason: 'factors must be an array' });
    const recommendations = require('../utils/recommend').getRecommendations(factors);
    return res.json({ risk_level: risk_level || 'unknown', factors, recommendations, status: 'ok' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;


