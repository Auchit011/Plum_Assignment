# Windows PowerShell test script for AI Health Risk Profiler
# Usage: Open PowerShell, cd to project root, run: .\samples\run_tests_windows.ps1

$base = 'http://localhost:3000'

function Show-Resp($name, $cmd) {
    Write-Host "\n=== $name ===" -ForegroundColor Cyan
    try {
        $out = & $cmd
        Write-Host $out
    } catch {
        Write-Host "ERROR: $_" -ForegroundColor Red
    }
}

# Ensure sample JSON files exist. If not, create them.
@'{
  "age": 42,
  "smoker": true,
  "exercise": "rarely",
  "diet": "high sugar"
}'@ > samples/parse_typed.json

@'{
  "text": "Age: 42\nSmoker: yes\nExercise: rarely\nDiet: high sugar"
}'@ > samples/parse_text.json

@'{
  "factors": ["smoking","poor diet","low exercise"]
}'@ > samples/factors.json

Write-Host "Using curl.exe; if you prefer Invoke-RestMethod adjust commands accordingly." -ForegroundColor Yellow

# 1) Health
Show-Resp "Health" { curl.exe -s -X GET "$base/health" }

# 2) Parse (typed JSON)
Show-Resp "Parse (typed JSON)" { curl.exe -s -X POST "$base/parse" -H "Content-Type: application/json" --data @samples/parse_typed.json }

# 3) Parse (raw text)
Show-Resp "Parse (raw text)" { curl.exe -s -X POST "$base/parse" -H "Content-Type: application/json" --data @samples/parse_text.json }

# 4) Extract factors
Show-Resp "Extract Factors" { curl.exe -s -X POST "$base/extract-factors" -H "Content-Type: application/json" --data @samples/parse_typed.json }

# 5) Classify risk
Show-Resp "Classify Risk" { curl.exe -s -X POST "$base/classify-risk" -H "Content-Type: application/json" --data @samples/factors.json }

# 6) Recommendations
Show-Resp "Recommendations" { curl.exe -s -X POST "$base/recommendations" -H "Content-Type: application/json" --data @samples/factors.json }

# 7) Health analysis (image upload)
if (Test-Path "samples\sample_image.png") {
    Show-Resp "Health Analysis (image)" { curl.exe -s -X POST "$base/health-analysis" -F "image=@samples\sample_image.png" -H "Expect:" }
} else {
    Write-Host "\n⚠️ samples\sample_image.png not found. Place an image at samples\sample_image.png to test image upload." -ForegroundColor Yellow
}

Write-Host "\nAll tests finished." -ForegroundColor Green
