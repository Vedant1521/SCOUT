@echo off
title DPI Website Blocker
echo ============================================
echo    DPI-Based Website Blocker for Windows
echo ============================================
echo.
echo Starting Backend (API server on port 3001)...
start "DPI-Backend" cmd /c "cd /d "%~dp0backend" && node src/server.js"
timeout /t 2 /nobreak >nul
echo Starting Frontend (Dev server on port 5173)...
start "DPI-Frontend" cmd /c "cd /d "%~dp0frontend" && npm run dev"
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo NOTE: Run this script AS ADMINISTRATOR for full blocking features.
echo.
pause
