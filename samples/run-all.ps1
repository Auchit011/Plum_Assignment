Write-Host "Health" -ForegroundColor Cyan
Invoke-RestMethod -Method Get -Uri http://localhost:3000/health | ConvertTo-Json -Depth 5

Write-Host "Parse JSON" -ForegroundColor Cyan
$body = @{ smoking = "yes"; diet = "poor"; exercise = "low" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/parse -Headers @{"Content-Type"="application/json"} -Body $body | ConvertTo-Json -Depth 5

Write-Host "Extract Factors" -ForegroundColor Cyan
Invoke-RestMethod -Method Post -Uri http://localhost:3000/extract-factors -Headers @{"Content-Type"="application/json"} -Body $body | ConvertTo-Json -Depth 5

Write-Host "Classify Risk" -ForegroundColor Cyan
$factors = @{ factors = @('smoking','poor diet','low exercise') } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/classify-risk -Headers @{"Content-Type"="application/json"} -Body $factors | ConvertTo-Json -Depth 5

Write-Host "Recommendations" -ForegroundColor Cyan
$recs = @{ risk_level = 'high'; factors = @('smoking','poor diet','low exercise') } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/recommendations -Headers @{"Content-Type"="application/json"} -Body $recs | ConvertTo-Json -Depth 5


