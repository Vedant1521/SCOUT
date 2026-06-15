@echo off
chcp 65001 >nul
title DPI Analyzer - Setup & Run

echo ========================================
echo   DPI Analyzer - Setup & Run
echo ========================================
echo.

:: ---- Step 1: Check / Install MinGW-w64 ----
echo [1/5] Checking C++ compiler...

where x86_64-w64-mingw32-g++ >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set CC=x86_64-w64-mingw32-g++
    goto :compile
)

where g++ >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    g++ --version | find "6.3" >nul
    if %ERRORLEVEL% EQU 0 (
        echo WARNING: Your MinGW is GCC 6.3 which lacks C++17 support.
        echo Attempting to install MinGW-w64 via winget...
        winget install MartinStorsjo.LLVM-MinGW.UCRT --accept-package-agreements --silent >nul 2>&1
        for /f %%i in ('dir /s /b "%USERPROFILE%\AppData\Local\Microsoft\WinGet\Packages\MartinStorsjo.LLVM-MinGW.UCRT_*\mingw64\bin\g++.exe" 2^>nul') do set "CC=%%i"
        if not defined CC (
            echo.
            echo ERROR: Could not get a C++17 compiler. See instructions below.
            goto :no_compiler
        )
    )
    set CC=g++
)

if not defined CC (
    :no_compiler
    echo ┌─────────────────────────────────────────────────────────┐
    echo │  Install MinGW-w64 manually:                            │
    echo │  winget install MartinStorsjo.LLVM-MinGW.UCRT           │
    echo │                                                         │
    echo │  Or download from: https://winlibs.com/                 │
    echo │  Extract and add the mingw64\bin folder to PATH         │
    echo └─────────────────────────────────────────────────────────┘
    pause
    exit /b 1
)

:: ---- Step 2: Build C++ Engine ----
:compile
echo [2/5] Building DPI engine...
cd /d "%~dp0"
%CC% -std=c++17 -pthread -O2 -I include -o dpi_engine.exe src/dpi_mt.cpp src/pcap_reader.cpp src/packet_parser.cpp src/sni_extractor.cpp src/types.cpp -static-libgcc -static-libstdc++
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build failed.
    pause
    exit /b 1
)
echo DPI engine built: dpi_engine.exe

:: ---- Step 3: Check / Generate PCAP ----
echo [3/5] Checking test PCAP...
if not exist test_dpi.pcap (
    python generate_test_pcap.py
    if %ERRORLEVEL% NEQ 0 (
        echo WARNING: Could not generate test PCAP (Python required).
    )
)

:: ---- Step 4: Install backend deps ----
echo [4/5] Installing backend dependencies...
cd backend
call "C:\Program Files\nodejs\npm.cmd" install --silent 2>nul
cd ..

:: ---- Step 5: Start everything ----
echo [5/5] Starting services...
echo.

:: Start MongoDB if available
where mongod >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Starting MongoDB...
    start /B "" mongod --dbpath data --logpath data/mongod.log
)

:: Start backend
echo Starting backend on :3001...
start "DPI-Backend" cmd /c "cd backend && "C:\Program Files\nodejs\node.exe" src/server.js"

:: Wait for backend
ping -n 3 127.0.0.1 >nul

:: Start frontend
echo Starting frontend on :5173...
start "DPI-Frontend" cmd /c "cd frontend && "C:\Program Files\nodejs\npx.cmd" vite --host"

echo.
echo ┌─────────────────────────────────────────────────────────┐
echo │  DPI Analyzer is running!                               │
echo │                                                         │
echo │  Frontend:  http://localhost:5173                        │
echo │  Backend:   http://localhost:3001                        │
echo │  Upload a .pcap file and configure rules to begin.      │
echo │                                                         │
echo │  Press any key to stop all services...                  │
echo └─────────────────────────────────────────────────────────┘
pause >nul

:: Cleanup
echo Shutting down...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM mongod.exe >nul 2>&1
echo Done.
