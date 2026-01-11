# 🏥 AI-Powered Health Risk Profiler

A lightweight backend that ingests typed or scanned health questionnaires (images), extracts structured answers using OCR + parsing, converts answers to risk factors, computes a simple risk score, and returns actionable, non-diagnostic recommendations.

---

## 📋 Table of Contents

- Overview
- Quick Start
- API Endpoints
- Example curl Commands (Bash + Windows)
- Windows PowerShell test script
- Running the image (OCR) test
- Expected responses
- Submission checklist
- Project structure
- Development notes

---

## 🎯 Overview

This service performs the full pipeline required for Problem Statement 2: OCR → Factor Extraction → Risk Classification → Recommendations.
It handles noisy inputs, missing fields (with guardrails), and provides confidence scores and non-diagnostic guidance.

Key behaviors:
- Accepts **image uploads** (field `image`) for OCR-based parsing and end-to-end analysis.
- Accepts **typed JSON** or **raw text** for parsing and factor extraction endpoints to simplify testing.
- Implements guardrail: returns `{ "status": "incomplete_profile", "reason": ">50% fields missing" }` if over half of required fields are missing.

---

## 🚀 Quick Start

Prerequisites:
- Node.js (v14+ recommended)
- npm

Install and run:

```bash
git 
cd Ai-health-risk-profiler
npm install
npm run dev
```

Server will run at: `http://localhost:3000`

Create `samples/sample_image.png` with a test form for image upload tests (One is already added in `samples/` for convenience).

---

## 📡 API Endpoints (summary)

Base URL: `http://localhost:3000`

1) GET /health
- Simple health check

2) POST /health-analysis
- Content-Type: multipart/form-data
- Field: `image` (file)
- End-to-end OCR → parsing → factor extraction → scoring → recommendations

3) POST /parse
- Content-Type: application/json
- Body: either typed answers JSON (e.g. `{ "age":42, "smoker":true, ... }`) OR `{ "text": "raw text from image" }`
- Returns: `{ answers, missing_fields, confidence }`

4) POST /extract-factors
- Content-Type: application/json
- Body: answers JSON
- Returns: `{ factors, confidence }`

5) POST /classify-risk
- Content-Type: application/json
- Body: `{ "factors": ["smoking", "poor diet"] }`
- Returns: `{ riskLevel, score, rationale }`

6) POST /recommendations
- Content-Type: application/json
- Body: `{ "risk_level":"high", "factors": [...] }`
- Returns: `{ risk_level, factors, recommendations, status: "ok" }`

---

## 🔁 Example curl Commands

Below are copy‑pasteable commands for both Bash and Windows (PowerShell / curl.exe). Replace host if necessary.

### Health check
Bash:
```bash
curl -X GET http://localhost:3000/health
```
PowerShell:
```powershell
curl.exe -X GET http://localhost:3000/health
```

### Parse — typed JSON answers
Bash:
```bash
curl -X POST http://localhost:3000/parse \
  -H "Content-Type: application/json" \
  -d '{"age":42,"smoker":true,"exercise":"rarely","diet":"high sugar"}'
```
PowerShell (create file to avoid quoting issues):
```powershell
@'{"age":42,"smoker":true,"exercise":"rarely","diet":"high sugar"}'@ > samples/parse_typed.json
curl.exe -X POST http://localhost:3000/parse -H "Content-Type: application/json" --data @samples/parse_typed.json
```

### Parse — raw text (simulate OCR output)
Bash:
```bash
curl -X POST http://localhost:3000/parse \
  -H "Content-Type: application/json" \
  -d '{"text":"Age: 42\nSmoker: yes\nExercise: rarely\nDiet: high sugar"}'
```
PowerShell:
```powershell
@'{"text":"Age: 42\nSmoker: yes\nExercise: rarely\nDiet: high sugar"}'@ > samples/parse_text.json
curl.exe -X POST http://localhost:3000/parse -H "Content-Type: application/json" --data @samples/parse_text.json
```

### Extract factors (from answers JSON)
Bash:
```bash
curl -X POST http://localhost:3000/extract-factors \
  -H "Content-Type: application/json" \
  --data @samples/parse_typed.json
```
PowerShell:
```powershell
curl.exe -X POST http://localhost:3000/extract-factors -H "Content-Type: application/json" --data @samples/parse_typed.json
```

### Classify risk (from factors array)
Bash:
```bash
curl -X POST http://localhost:3000/classify-risk \
  -H "Content-Type: application/json" \
  -d '{"factors":["smoking","poor diet","low exercise"]}'
```
PowerShell:
```powershell
@'{"factors":["smoking","poor diet","low exercise"]}'@ > samples/factors.json
curl.exe -X POST http://localhost:3000/classify-risk -H "Content-Type: application/json" --data @samples/factors.json
```

### Recommendations
Bash:
```bash
curl -X POST http://localhost:3000/recommendations \
  -H "Content-Type: application/json" \
  -d '{"risk_level":"high","factors":["smoking","poor diet","low exercise"]}'
```
PowerShell:
```powershell
curl.exe -X POST http://localhost:3000/recommendations -H "Content-Type: application/json" --data @samples/factors.json
```

### Health analysis — full image upload (end-to-end)
Bash:
```bash
curl -X POST http://localhost:3000/health-analysis -F "image=@samples/sample_image.png"
```
PowerShell (curl.exe):
```powershell
curl.exe -X POST http://localhost:3000/health-analysis -F "image=@samples\sample_image.png" -H "Expect:"
```
(The `-H "Expect:"` avoids 100-continue issues on some Windows setups.)

---

## 🪟 Windows PowerShell test script

A convenience script has been added: `samples/run_tests_windows.ps1` — run it from the repo root in PowerShell:

```powershell
cd Ai-health-risk-profiler
.\samples\run_tests_windows.ps1
```

The script will create small sample JSON files (if missing) and sequentially call each endpoint, printing results.

---

## ✅ Expected JSON Responses (examples)

- **/parse** → `{ "answers": {...}, "missing_fields": [...], "confidence": 0.9 }`
- **/extract-factors** → `{ "factors": ["smoking","poor diet"], "confidence": 0.9 }`
- **/classify-risk** → `{ "riskLevel":"high","score":78,"rationale":["smoking","high sugar diet","low activity"] }`
- **/recommendations** → `{ "risk_level":"high","factors":[...],"recommendations":["Quit smoking","Reduce sugar","Walk 30 mins daily"],"status":"ok" }`
- **/health-analysis** (image) → same final structure as `/recommendations` or an incomplete_profile guardrail response when >50% fields missing.

---


## 🧭 Project structure (short)

```
Ai-health-risk-profiler/
├─ controllers/
├─ services/
├─ utils/
├─ routes/
├─ samples/
├─ uploads/ (temp)
├─ server.js
├─ package.json
├─ README.md
```

---

## 🛠️ Development notes

- Add unit tests for parsing and scoring to increase reliability.
- Add additional OCR preprocessing for very noisy images (deskew/denoise) if needed.
- The project uses Tesseract.js — if you plan to test at scale consider CPU constraints and provide a hosted OCR service.

---


### Core Functionality
- **Single Endpoint**: Complete health analysis in one API call
- **Handwritten Text Support**: Processes messy, handwritten forms
- **Real-time Processing**: Fast analysis with detailed logging
- **Error Handling**: Graceful handling of incomplete data
- **Confidence Scoring**: OCR confidence and validation metrics

### Technical Features
- **Multi-Engine OCR**: Multiple Tesseract strategies for better accuracy
- **Pattern Recognition**: Advanced text parsing for various formats
- **Risk Calculation**: Sophisticated scoring algorithm
- **Recommendation Engine**: AI-powered health advice
- **Comprehensive Logging**: Detailed request/response tracking

## 🏗️ Architecture

![Architecture Text](/assets/architecture.png)

### System Components

#### 1. **OCR Service** (`services/ocrService.js`)
- Multi-strategy OCR processing
- Handwritten text optimization
- Confidence scoring and validation
- Text cleanup and normalization

#### 2. **Factor Service** (`services/factorService.js`)
- Health factor extraction
- Pattern matching for various formats
- Data validation and normalization

#### 3. **Scoring Engine** (`utils/scoring.js`)
- Risk level calculation
- Weighted scoring algorithm
- Rationale generation

#### 4. **Recommendation Engine** (`utils/recommend.js`)
- Personalized health advice
- Factor-specific recommendations
- Actionable guidance


## ✍️ Handwritten Text Support

### Supported Formats

The system can process various handwritten formats:

#### Format 1: Arrow Notation
```
smokeel -> No
Exercise - Moderate
Age - 29
```

#### Format 2: Colon Notation
```
Age: 42
Smoker: yes
Exercise: rarely
Diet: high sugar
```

#### Format 3: Mixed Format
```
Age 29
Smoking: No
Exercise Level: Moderate
```

### OCR Processing

The system uses multiple OCR strategies:

1. **Standard OCR**: Basic text recognition
2. **Handwritten Optimized**: Neural nets LSTM engine
3. **Legacy Engine**: Fallback for difficult cases

### Text Cleanup

The system automatically handles:
- Character misrecognitions (`gmolkeexr` → `smoker`)
- Symbol corrections (`—` → `-`)
- Space normalization
- Pattern extraction from garbled text

## 📊 Risk Scoring System

### Scoring Algorithm

| Factor | Points | Description |
|--------|--------|-------------|
| **Smoking** | +30 | Current smoker |
| **Poor Diet** | +20 | High sugar/unhealthy diet |
| **Low Exercise** | +28 | Sedentary lifestyle |
| **Age** | +15 | 65+ years old |

### Risk Levels

| Score Range | Risk Level | Description |
|-------------|------------|-------------|
| 0-40 | **Low** | Minimal health risks |
| 41-70 | **Medium** | Moderate health concerns |
| 71+ | **High** | Significant health risks |

### Example Calculations

**Example 1: High Risk**
- Smoking: +30
- Poor Diet: +20
- Low Exercise: +28
- **Total: 78 points** → **High Risk**

**Example 2: Medium Risk**
- Age: +15
- Poor Diet: +20
- **Total: 35 points** → **Medium Risk**


## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm test         # Run tests (if implemented)
```

### Development Workflow

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Test with Sample Data**
   - Use the provided Postman collection
   - Test with handwritten images
   - Monitor logs for debugging

3. **Add New Features**
   - Follow the existing architecture
   - Add comprehensive logging
   - Update tests and documentation

### Logging

The system provides detailed logging for:

- **Request Processing**: Each step of the analysis
- **OCR Results**: Text extraction and confidence
- **Factor Detection**: Health factor identification
- **Risk Calculation**: Scoring and rationale
- **Error Handling**: Detailed error information

#### Log Format Example
```
🌐 [2024-01-15T10:30:15.123Z] POST /health-analysis
👤 User-Agent: PostmanRuntime/7.32.3
📸 File Upload: health-form.png (245KB)
[abc123] 🏥 Health Analysis Request Started
[abc123] 🔍 OCR: Starting text extraction...
[abc123] ✅ OCR: Text extracted successfully
[abc123] 📊 OCR: Confidence: 92.5%
[abc123] 📋 Parser: Final answers: {age: 42, smoker: true, exercise: "rarely", diet: "high sugar"}
[abc123] 📊 Scoring: Risk Level: high, Score: 78
[abc123] ✅ Analysis completed successfully
```


## 🤝 Contributing

### Getting Started

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style

- Use meaningful variable names
- Add comprehensive logging
- Follow existing architecture patterns
- Update documentation for new features

### Pull Request Process

1. Ensure all tests pass
2. Update README if needed
3. Add appropriate labels
4. Request review from maintainers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

1. **OCR Not Working**
   - Check image quality and format
   - Ensure text is clearly visible
   - Try different image formats

2. **Low Confidence Results**
   - Use higher resolution images
   - Ensure good lighting
   - Write more clearly

3. **Missing Fields**
   - Check that all required fields are present
   - Ensure text is readable
   - Try different handwriting styles

### Getting Help

- **Issues**: Create a GitHub issue
- **Documentation**: Check this README
- **Examples**: See `samples/` directory
- **Logs**: Check server console output

## 🔮 Future Enhancements

### Planned Features

- **Multi-language Support**: OCR for different languages
- **Advanced AI**: GPT integration for better recommendations
- **Database Integration**: Store and track health profiles
- **Mobile App**: Native mobile application
- **Batch Processing**: Multiple image processing
- **Advanced Analytics**: Health trend analysis

### Roadmap

- **Phase 1**: Core functionality ✅
- **Phase 2**: Enhanced OCR and AI
- **Phase 3**: Database and persistence
- **Phase 4**: Mobile and web interfaces
- **Phase 5**: Advanced analytics and reporting

---

**Made with ❤️ for better health analysis**
