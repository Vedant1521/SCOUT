@echo off
echo Restarting DPI Backend...
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak >nul
cd /d "%~dp0backend"
start "DPI-Backend" node src/server.js
timeout /t 3 /nobreak >nul
echo Done. Server restarted.
