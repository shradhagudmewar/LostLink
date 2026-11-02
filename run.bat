@echo off
cd /d "%~dp0"
title LostLink Campus - 1-Click Instant Startup

echo ========================================================
echo   Starting LostLink - Smart College Lost ^& Found Portal
echo ========================================================
echo.

:: Free up ports 5000 and 5173 if they were left open from previous sessions
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5000" ^| findstr "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5173" ^| findstr "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

:: Start both servers concurrently
echo [1/2] Launching Backend and Frontend servers...
start /b node ./node_modules/concurrently/dist/bin/concurrently.js "npm run dev --prefix backend" "npm run dev --prefix frontend"

:: Wait 3 seconds for servers to initialize
timeout /t 3 /nobreak >nul

:: Automatically open browser
echo [2/2] Opening LostLink in your default browser...
start http://localhost:5173

echo.
echo ========================================================
echo   LostLink is successfully running! (Ready in 3 seconds)
echo   - Web Portal: http://localhost:5173
echo   - Unified API: http://localhost:5000
echo.
echo   Press Ctrl+C in this window anytime to stop.
echo ========================================================
echo.
pause
