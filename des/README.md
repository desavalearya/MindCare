# Emotion-Aware Motivational Chatbot

A chatbot that provides motivational responses based on emotion analysis of user input. Emotions are logged for analysis but never shown to the user during conversations.

## Features
- **Text and Voice Input**: Choose per-turn or force one mode
- **Emotion Analysis**: Uses multiple Hugging Face models (internal only)
- **Motivational Responses**: Tailored to detected emotional state
- **CSV Logging**: Timestamps and emotions saved to `emotion_log.csv`
- **Stop Controls**: Say/type "stop", "exit", "quit", "end", or "bye"

## Quick Start

### Option 1: Run with Batch Script (Easiest)
1. Double-click `run_chatbot.bat`
2. Choose Text (1), Voice (2), or Interactive (3) mode
3. The script handles environment setup automatically

### Option 2: VS Code Setup
1. **Open Project**: Open `c:\ASEP_PROJECT\des` in VS Code
2. **Select Interpreter**: 
   - Press `Ctrl+Shift+P` → "Python: Select Interpreter"
   - Choose `C:\ASEP_PROJECT\anaconda3\python.exe`
3. **Install Dependencies**:
   ```powershell
   pip install -r requirements.txt
   ```
4. **Run Options**:
   - **Run & Debug**: Use the pre-configured launch targets
   - **Terminal**: Use commands below

### Option 3: Terminal Commands
```powershell
# Set environment (required each session)
$env:GEMINI_API_KEY="AIzaSyDbFxgOPiFpLqeDuHjBH4KcVInJ2E5o8U4"

# Run modes
C:\ASEP_PROJECT\anaconda3\python.exe chatbot_app.py --text    # Text only
C:\ASEP_PROJECT\anaconda3\python.exe chatbot_app.py --voice   # Voice only  
C:\ASEP_PROJECT\anaconda3\python.exe chatbot_app.py          # Choose each turn
```

## Configuration

### Environment Variables (.env file)
```
GEMINI_API_KEY=AIzaSyDbFxgOPiFpLqeDuHjBH4KcVInJ2E5o8U4
FFMPEG_PATH=C:\ASEP_PROJECT\anaconda3\Library\bin\ffmpeg-8.0\bin\ffmpeg.exe
```

### FFmpeg Setup
The app auto-detects FFmpeg from:
1. `FFMPEG_PATH` environment variable
2. `%CONDA_PREFIX%\Library\bin\ffmpeg.exe`
3. `C:\ASEP_PROJECT\anaconda3\Library\bin\ffmpeg.exe`
4. Versioned subdirectories like `ffmpeg-8.0\bin\`

If auto-detection fails, set `FFMPEG_PATH` in `.env` to your binary location.

## Troubleshooting

### "Environment not selected" in VS Code
- Ensure Python interpreter is set to `C:\ASEP_PROJECT\anaconda3\python.exe`
- Reload VS Code window (`Ctrl+Shift+P` → "Developer: Reload Window")

### Gemini API Errors
- Check your API key is valid and has quota
- The app automatically tries fallback models: `gemini-1.5-flash` → `gemini-1.5-pro` → `gemini-1.0-pro`

### Audio Issues
- Verify FFmpeg path in startup logs
- For voice input, ensure microphone permissions are granted
- Check Windows audio settings if TTS playback fails

## Files
- `chatbot_app.py` - Main application
- `emotion_analyzer.py` - Emotion detection models
- `emotion_log.csv` - Logged conversations with emotions
- `.env` - Environment variables
- `run_chatbot.bat` - Easy launcher script
- `.vscode/` - VS Code configuration