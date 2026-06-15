@echo off
title DPI Website Blocker

:: Auto-request admin elevation
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Requesting administrator privileges...
    powershell -Command "Start-Process cmd -ArgumentList '/c cd /d \"%~dp0\" && \"%~f0\"' -Verb RunAs"
    exit /b
)

echo ============================================
echo    DPI-Based Website Blocker for Windows
echo ============================================
echo.
echo Running as Administrator: YES
echo.

:: Kill any existing node processes on port 3001
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001.*LISTENING"') do (
    echo Stopping existing backend on port 3001...
    taskkill /F /PID %%a 2>nul
)
timeout /t 2 /nobreak >nul

echo Starting Backend (API server on port 3001)...
start "DPI-Backend" cmd /c "cd /d "%~dp0backend" && node src/server.js"
timeout /t 3 /nobreak >nul
echo Starting Frontend (Dev server on port 5173)...
start "DPI-Frontend" cmd /c "cd /d "%~dp0frontend" && npm run dev"
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo All blocking features are active with admin privileges.
echo.
pause
