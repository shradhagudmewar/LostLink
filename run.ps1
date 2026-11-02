# LostLink Instant Launcher for PowerShell / VS Code Terminal
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  LostLink - Instant College Lost & Found Portal Launcher" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Stop any old node process on port 5000 or 5173
Get-NetTCPConnection -LocalPort 5000, 5173 -ErrorAction SilentlyContinue | ForEach-Object {
    try { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } catch {}
}

Write-Host "[1/2] Launching LostLink servers (Concurrent mode)..." -ForegroundColor Green
Start-Process "http://localhost:5173"

node ./node_modules/concurrently/dist/bin/concurrently.js "npm run dev --prefix backend" "npm run dev --prefix frontend"
