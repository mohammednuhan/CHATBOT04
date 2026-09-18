$ErrorActionPreference = "Stop"

$root = $PSScriptRoot

Write-Host "Starting Agent backend (http://127.0.0.1:8000)..." -ForegroundColor Cyan
$backend = Start-Process -FilePath "$root\.venv\Scripts\python.exe" `
    -ArgumentList "-m uvicorn server:app --port 8000" `
    -WorkingDirectory $root `
    -RedirectStandardOutput "$root\backend.log" `
    -RedirectStandardError "$root\backend.err.log" `
    -WindowStyle Hidden `
    -PassThru

Start-Sleep -Seconds 4

Write-Host "Starting Agent frontend (http://127.0.0.1:5173)..." -ForegroundColor Cyan
Set-Location "$root\client"
npm run dev

Write-Host ""
Write-Host "Chatbot is running at: http://127.0.0.1:5173" -ForegroundColor Green
Write-Host "Backend running at:    http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the frontend." -ForegroundColor Yellow