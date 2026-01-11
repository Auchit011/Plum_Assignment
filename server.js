const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const routes = require('./routes');

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  console.log(`\n🌐 [${timestamp}] ${method} ${url}`);
  console.log(`👤 User-Agent: ${userAgent}`);
  
  if (req.file) {
    console.log(`📸 File Upload: ${req.file.originalname} (${req.file.size} bytes)`);
  }
  
  // Log response when it's sent
  const originalSend = res.send;
  res.send = function(data) {
    const statusCode = res.statusCode;
    const statusEmoji = statusCode >= 200 && statusCode < 300 ? '✅' : 
                       statusCode >= 400 && statusCode < 500 ? '⚠️' : '❌';
    
    console.log(`${statusEmoji} [${timestamp}] Response: ${statusCode} ${res.statusMessage}`);
    
    if (statusCode >= 400) {
      console.log(`📄 Error Response:`, data);
    }
    
    return originalSend.call(this, data);
  };
  
  next();
});

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// File uploads (for OCR)
const upload = multer({ dest: path.join(__dirname, 'uploads') });
app.use((req, res, next) => {
  req.upload = upload; // expose for routes needing it
  next();
});

// Routes
app.use('/', routes);

// Health endpoint moved to routes

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ status: 'error', message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;

console.log(`\n🚀 Starting AI-Powered Health Risk Profiler...`);
console.log(`📅 Server Start Time: ${new Date().toISOString()}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`📦 Node Version: ${process.version}`);

app.listen(PORT, () => {
  console.log(`\n✅ Server Successfully Started!`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`📸 Main Endpoint: http://localhost:${PORT}/health-analysis`);
  console.log(`📊 Server Status: Running and ready to accept requests`);
  console.log(`\n📝 Logs will appear below for each request...\n`);
});

module.exports = app;


