@echo off
echo ========================================
echo   MindCare Project Startup
echo ========================================
echo.

echo [1/3] Starting Backend Server (Port 8083)...
start "MindCare Backend" cmd /k "cd server && node index.js"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Frontend Dev Server (Port 8080)...
start "MindCare Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo   MindCare is starting up!
echo ========================================
echo.
echo Backend:  http://localhost:8083
echo Frontend: http://localhost:8080
echo.
echo Press any key to close this window...
pause >nul
