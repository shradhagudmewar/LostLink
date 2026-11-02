@echo off
cd /d "%~dp0"
title LostLink Full-Stack Server (Unified Port 5000)

echo ========================================================
echo   LostLink - Instant Full-Stack Launcher (Port 5000)
echo ========================================================
echo.

:: Clear port 5000 if occupied
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5000" ^| findstr "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

:: Open browser automatically
start http://localhost:5000

:: Start the unified server
echo Starting unified server on http://localhost:5000 ...
node backend/server.js
