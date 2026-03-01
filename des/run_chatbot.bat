@echo off
echo Starting Emotion-Aware Chatbot...
echo.

REM Activate environment and set variables
set GEMINI_API_KEY=AIzaSyDbFxgOPiFpLqeDuHjBH4KcVInJ2E5o8U4
set FFMPEG_PATH=ffmpeg.exe

REM Verify Python and FFmpeg
echo Checking Python installation...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python not found. Please install Python.
    pause
    exit /b 1
)

echo Checking FFmpeg...
where ffmpeg > nul 2>&1
if %errorlevel% equ 0 (
    echo FFmpeg found in PATH
) else (
    echo WARNING: FFmpeg not found in PATH
    echo You may need to install FFmpeg or update FFMPEG_PATH in this script or .env
)

echo.
echo Choose mode:
echo [1] Text mode (type messages)
echo [2] Voice mode (speak messages)  
echo [3] Interactive mode (choose each turn)
set /p choice="Enter choice (1-3): "

if "%choice%"=="1" (
    echo Starting in TEXT mode...
    python chatbot_app.py --text
) else if "%choice%"=="2" (
    echo Starting in VOICE mode...
    python chatbot_app.py --voice
) else (
    echo Starting in INTERACTIVE mode...
    python chatbot_app.py
)

pause