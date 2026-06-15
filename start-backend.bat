@echo off
cd /d "%~dp0backend"
echo Starting DPI Blocker Backend...
echo Note: Run as Administrator for full blocking capabilities (hosts file + firewall)
node src/server.js
pause
