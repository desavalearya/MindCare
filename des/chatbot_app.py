import os
# This line MUST be at the top to prevent a common library conflict error.
os.environ['KMP_DUPLICATE_LIB_OK'] = 'True'

import sys
import tempfile
import csv
import time
from datetime import datetime
from typing import Optional
import io

try:
    import speech_recognition as sr
    SR_AVAILABLE = True
except Exception:
    SR_AVAILABLE = False
from gtts import gTTS
from transformers import pipeline
import google.generativeai as genai
from pydub import AudioSegment
from pydub.playback import play
from dotenv import load_dotenv, find_dotenv
import requests
# from emotion_analyzer import EmotionAnalyzer  # Assuming this is your local file

# --- Mock EmotionAnalyzer for standalone execution ---
# Replace this with your actual class import
class EmotionAnalyzer:
    def analyze(self, text):
        # Mock analysis
        return [{'label': 'neutral', 'score': 0.9}]
    def synthesize_emotions(self, raw_emotions):
        # Mock synthesis
        return {'neutral': 0.9, 'sadness': 0.1}
# ----------------------------------------------------


# Load environment variables from .env if present
_env_path = find_dotenv()
if _env_path:
    load_dotenv(_env_path)
    print(f"Loaded environment variables from: {_env_path}")
else:
    print("No .env file found; relying on system environment variables.")

# --- AUDIO PLAYBACK SETUP ---
def _find_ffmpeg_path() -> Optional[str]:
    """Resolve FFmpeg path from env or common install locations on Windows."""
    # 1) Env var takes precedence
    env_path = os.getenv("FFMPEG_PATH")
    if env_path and os.path.isfile(env_path):
        return env_path

    # 2) Common Anaconda location
    candidates = []
    conda_bin = os.path.join(os.path.expandvars(r"%CONDA_PREFIX%"), "Library", "bin")
    candidates.extend([
        os.path.join(conda_bin, "ffmpeg.exe"),
        os.path.join(conda_bin, "ffprobe.exe"),
    ])

    # 3) Project-local Anaconda path (as per your screenshot)
    proj_bin = r"C:\ASEP_PROJECT\anaconda3\Library\bin"
    candidates.extend([
        os.path.join(proj_bin, "ffmpeg.exe"),
        os.path.join(proj_bin, "ffprobe.exe"),
        # Some distributions place the binaries under versioned subfolders
        os.path.join(proj_bin, "ffmpeg-8.0", "bin", "ffmpeg.exe"),
        os.path.join(proj_bin, "ffmpeg-8.0", "bin", "ffprobe.exe"),
    ])

    for c in candidates:
        if os.path.isfile(c) and c.lower().endswith("ffmpeg.exe"):
            return c
    # last resort: rely on PATH; pydub will attempt but we warn
    return None

FFMPEG_PATH = _find_ffmpeg_path()
if FFMPEG_PATH:
    AudioSegment.converter = FFMPEG_PATH
    # Also add its directory to PATH for ffprobe and codecs
    ff_dir = os.path.dirname(FFMPEG_PATH)
    os.environ['PATH'] = ff_dir + os.pathsep + os.environ.get('PATH', '')
    print(f"FFmpeg path set: {FFMPEG_PATH}")
else:
    print("Warning: FFmpeg not resolved automatically. Set FFMPEG_PATH in .env.")

# --- 1. SECURE CONFIGURATION ---
# This safely loads your key from the system's environment variables.
# HOW TO SET: In your terminal, run `setx GEMINI_API_KEY "YOUR_API_KEY_HERE"` and then restart the terminal.
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SMARTWATCH_GOOGLE_CLIENT_ID = os.getenv("SMARTWATCH_GOOGLE_CLIENT_ID")
SMARTWATCH_GOOGLE_CLIENT_SECRET = os.getenv("SMARTWATCH_GOOGLE_CLIENT_SECRET")
SMARTWATCH_GOOGLE_REDIRECT_URI = os.getenv("SMARTWATCH_GOOGLE_REDIRECT_URI")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("WARNING: GEMINI_API_KEY not set. Gemini features disabled; using offline responses.")


# --- 2. INITIALIZE MODELS (Done once at the start) ---
print("Deferring heavy model initialization until first use.")
asr_pipeline = None
emotion_engine = None

def get_asr_pipeline():
    """Lazy-load and cache the ASR pipeline on first use."""
    global asr_pipeline
    if asr_pipeline is None:
        print("Loading ASR pipeline (first use)...")
        asr_pipeline = pipeline(
            "automatic-speech-recognition",
            model="openai/whisper-medium.en",  # English-only variant avoids language auto-detection issues
        )
    return asr_pipeline

def get_emotion_engine():
    """Lazy-load and cache the EmotionAnalyzer."""
    global emotion_engine
    if emotion_engine is None:
        emotion_engine = EmotionAnalyzer()
    return emotion_engine
# --- THIS LINE WAS CORRECTED ---
def _select_available_gemini_model_name() -> Optional[str]:
    """List available models and pick a text-capable Gemini model name."""
    try:
        models = genai.list_models()
    except Exception as e:
        print(f"Could not list Gemini models: {e}")
        return None

    candidates = []
    for m in models:
        name = getattr(m, 'name', '')
        methods = (
            getattr(m, 'generation_methods', [])
            or getattr(m, 'generationMethods', [])
            or getattr(m, 'supported_generation_methods', [])
        )
        if name and 'gemini' in name and methods and ('generateContent' in methods or 'generate' in methods):
            candidates.append(name)
    print(f"Gemini list_models candidates: {candidates}")

    # Prefer 1.5 flash/pro, then 1.0, otherwise first available
    order = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro', 'gemini-pro']
    for pref in order:
        for c in candidates:
            if pref in c:
                return c
    return candidates[0] if candidates else None

def _init_gemini_model():
    """Try preferred names, else list and pick available; return None if unavailable."""
    preferred = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro', 'gemini-pro', 'models/gemini-pro']
    for name in preferred:
        try:
            m = genai.GenerativeModel(name)
            m.generate_content("ping")
            print(f"Gemini model selected: {name}")
            return m
        except Exception as e:
            print(f"Gemini model '{name}' not available: {e}")
            continue

    avail_name = _select_available_gemini_model_name()
    if avail_name:
        # genai accepts either bare or full name; try bare by trimming prefix if present
        bare = avail_name.replace('models/', '')
        try:
            m = genai.GenerativeModel(bare)
            m.generate_content("ping")
            print(f"Gemini model selected (listed): {bare}")
            return m
        except Exception as e:
            print(f"Listed model '{avail_name}' failed to init: {e}")
            # try full name
            try:
                m = genai.GenerativeModel(avail_name)
                m.generate_content("ping")
                print(f"Gemini model selected (full): {avail_name}")
                return m
            except Exception as e2:
                print(f"Full model name '{avail_name}' failed to init: {e2}")

    print("No compatible Gemini model found. Falling back to offline motivational responses.")
    return None

gemini_model = None

def get_gemini_model():
    """Lazy-load and cache the Gemini model on first use. Returns None if key missing."""
    global gemini_model
    if gemini_model is None and GEMINI_API_KEY:
        gemini_model = _init_gemini_model()
    return gemini_model
recognizer = sr.Recognizer() if SR_AVAILABLE else None  # Initialize recognizer only if available
print("\n--- All models initialized. Chatbot is ready! ---")


# --- 3. CORE CHATBOT FUNCTIONS ---
def listen_and_transcribe():
    """
    Listens for speech, stops on silence, and transcribes the audio.
    """
    if not SR_AVAILABLE:
        print("Voice input is unavailable (SpeechRecognition not installed). Please use Text mode.")
        return ""
    with sr.Microphone() as source:
        print("\nListening... (I'll stop when you pause)")
        recognizer.adjust_for_ambient_noise(source, duration=1)
        try:
            audio = recognizer.listen(source, timeout=5, phrase_time_limit=15)
        except sr.WaitTimeoutError:
            return "(No speech detected, listening again...)"

    print("Finished listening. Transcribing...")
    audio_data = audio.get_wav_data(convert_rate=16000)
    try:
        text = get_asr_pipeline()(audio_data)["text"]
    except Exception as e:
        print(f"ASR pipeline error, falling back to Google SR: {e}")
        try:
            text = recognizer.recognize_google(audio, language="en-US")
        except Exception as e2:
            print(f"Fallback SR failed: {e2}")
            return ""
    print(f"You said: {text}")
    return text.strip()

def generate_offline_response(user_text: str, dominant: str) -> str:
    empathize_map = {
        'sadness': "I'm really sorry you're feeling this way. Some days are heavy, and it's okay to say that.",
        'fear': "Feeling on edge makes everything harder. You're not alone in that.",
        'anger': "It’s understandable to feel upset when things stack up. I’m here with you.",
        'disgust': "When things feel off or wrong, it can be draining. I hear you.",
        'surprise': "Unexpected stuff can throw anyone off balance. That’s human.",
        'neutral': "Thanks for sharing how you're doing. I’m listening.",
    }
    tip_map = {
        'sadness': "Could we try a tiny kindness for yourself today—like stepping outside or writing one good thing you did?",
        'fear': "We can slow it down together: try a 4–6 breath (in for 4, out for 6) and pick one small step you can control.",
        'anger': "Want to pause for 10 seconds and note what’s in your control right now? One small action can help.",
        'disgust': "Let’s shift attention gently: what’s one helpful action you value today—something small you can do?",
        'surprise': "Ground with the 5–4–3–2–1 technique (five things you see, four you feel, three you hear…).",
        'neutral': "Would picking one small goal for the next five minutes feel doable?",
    }
    empathize = empathize_map.get(dominant, "Thanks for telling me how you’re feeling. I’m with you.")
    tip = tip_map.get(dominant, "Let’s choose one small, doable step together.")
    reflect = f"From what you shared, it sounds like: '{user_text}'."
    question = "What’s the part that feels heaviest right now—or what would help even a little?"
    return f"{empathize} {reflect} {tip} {question}"

def get_chatbot_response(user_text, emotions, history):
    """Generates a response guided by internal emotions; falls back offline if needed."""
    dominant = max(emotions, key=emotions.get)
    m = get_gemini_model()
    if m is None:
        ai_text = generate_offline_response(user_text, dominant)
        print(f"AI Response: {ai_text}")
        return ai_text

    print("Gemini is thinking...")
    tone_tip = {
        'sadness': "Offer reassurance and remind them they are not alone.",
        'fear': "Focus on safety and small, manageable steps.",
        'anger': "Acknowledge feelings and encourage calm reflection.",
        'disgust': "Validate feelings and shift focus to helpful actions.",
        'surprise': "Maintain a calm, grounding presence.",
        'neutral': "Keep things supportive and open-ended."
    }.get(dominant, "Be empathetic and supportive.")
    
    # Format the conversation history for the prompt
    formatted_history = "\n".join([f"{msg['role']}: {msg['content']}" for msg in history])


    prompt = f"""
    You are a compassionate and perceptive AI companion.

    This is the conversation history so far:
    --- HISTORY ---
    {formatted_history}
    --- END HISTORY ---

    The user's latest message is: "{user_text}".
    You have internal sentiment indicators for this latest message. Use them to guide tone, but do not mention emotion names or scores.
    Guidance: {tone_tip}

    Respond naturally and supportively. Your response should:
    - Briefly acknowledge what they said with empathy, keeping the history in mind.
    - Offer one practical motivational suggestion (e.g., a small achievable step, breathing exercise, reframing, reaching out).
    - Ask one gentle, open-ended question to continue the conversation.
    - Keep it concise and friendly.
    - Do NOT reveal or list any emotions or probabilities.
    """
    try:
        response = m.generate_content(prompt)
        ai_text = response.text
        print(f"AI Response: {ai_text}")
        return ai_text
    except Exception as e:
        print(f"An error occurred with Gemini: {e}")
        # fall back instantly if Gemini fails mid-run
        ai_text = generate_offline_response(user_text, dominant)
        print(f"Offline Response: {ai_text}")
        return ai_text

def speak_response(text):
    """Converts the chatbot's text response to speech using a temporary file."""
    try:
        tts = gTTS(text=text, lang='en')
        temp_dir = tempfile.gettempdir()
        audio_file = os.path.join(temp_dir, "response.mp3")
        tts.save(audio_file)
        song = AudioSegment.from_mp3(audio_file)
        play(song)
        try:
            os.remove(audio_file)
        except Exception:
            pass
    except Exception as e:
        print(f"Error in text-to-speech: {e}")

def tts_mp3_bytes(text: str) -> bytes:
    """Generate TTS mp3 bytes without playing audio (for API responses)."""
    try:
        tts = gTTS(text=text, lang='en')
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
            fname = tmp.name
        tts.save(fname)
        with open(fname, 'rb') as f:
            data = f.read()
        try:
            os.remove(fname)
        except Exception:
            pass
        return data
    except Exception as e:
        print(f"Error generating TTS mp3: {e}")
        return b""

def log_emotions_to_csv(timestamp_iso: str, text: str, emotions: dict, filepath: str = "emotion_log.csv"):
    """Log timestamped emotions and the user text to a CSV file.
    Writes only non-zero emotions; absent emotions are left blank instead of 0.0.
    """
    fields = ["timestamp", "text", "neutral", "sadness", "fear", "disgust", "surprise", "anger"]

    # Helper to format values: only keep non-zero; blank otherwise
    def fmt(label: str):
        val = emotions.get(label)
        if val is None:
            return ""
        # Treat very small values as zero to avoid noise
        return f"{val:.6f}" if val > 0.0 else ""

    row = {
        "timestamp": timestamp_iso,
        "text": text,
        "neutral": fmt("neutral"),
        "sadness": fmt("sadness"),
        "fear": fmt("fear"),
        "disgust": fmt("disgust"),
        "surprise": fmt("surprise"),
        "anger": fmt("anger"),
    }

    new_file = not os.path.exists(filepath)
    with open(filepath, mode="a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        if new_file:
            writer.writeheader()
        writer.writerow(row)


# --- 4. MAIN CHAT LOOP ---
STOP_KEYWORDS = {"stop", "exit", "quit", "end", "bye"}

def prompt_input_choice() -> str:
    """Prompt the user to choose Text or Voice input for this turn."""
    while True:
        default_prompt = "[T]ext or [V]oice (default V): " if SR_AVAILABLE else "[T]ext (Voice unavailable): "
        choice = input(f"Choose input: {default_prompt}").strip().lower()
        if choice in ("t", "text"):
            return "text"
        if SR_AVAILABLE and choice in ("v", "voice", ""):
            return "voice"
        print("Please enter T" + (" or V" if SR_AVAILABLE else "" ) + ".")

def main(text_mode: bool | None = None):
    """Run the chatbot. text_mode=True forces Text; False forces Voice; None prompts each turn."""
    speak_response("Hello! I'm ready to listen. What's on your mind?")
    
    # *** ADDED: Initialize conversation history ***
    conversation_history = []

    while True:
        # Decide input mode per turn
        if text_mode is None:
            mode = prompt_input_choice()
        else:
            mode = "text" if text_mode else "voice"

        if mode == "text":
            user_input = input("You: ").strip()
        else:
            if not SR_AVAILABLE:
                print("Voice mode selected, but SpeechRecognition is unavailable. Switching to Text.")
                user_input = input("You: ").strip()
            else:
                user_input = listen_and_transcribe()

        if not user_input or len(user_input) < 3:
            continue

        # Stop controls: voice or text
        if any(k in user_input.lower() for k in STOP_KEYWORDS):
            speak_response("Goodbye for now. Take care!")
            print("Conversation stopped by user.")
            break

        # Emotion analysis and logging
        engine = get_emotion_engine()
        raw_emotions = engine.analyze(user_input)
        top_emotions = engine.synthesize_emotions(raw_emotions)
        timestamp = datetime.utcnow().isoformat()
        log_emotions_to_csv(timestamp, user_input, top_emotions)

        # *** MODIFIED: Pass history to the response function ***
        ai_response = get_chatbot_response(user_input, top_emotions, conversation_history)
        
        # *** ADDED: Update conversation history ***
        conversation_history.append({"role": "User", "content": user_input})
        conversation_history.append({"role": "AI", "content": ai_response})
        
        # Optional: Keep history from getting too long to save tokens
        if len(conversation_history) > 12: # 6 pairs of user/AI turns
            conversation_history = conversation_history[-12:]

        print(f"Bot: {ai_response}")
        speak_response(ai_response)

if __name__ == "__main__":
    force_text = ("--text" in sys.argv) or (os.getenv("CHATBOT_TEXT_MODE") == "1")
    force_voice = ("--voice" in sys.argv) and SR_AVAILABLE
    if force_text and force_voice:
        print("Both --text and --voice provided; defaulting to per-turn choice.")
        text_mode_flag = None
    elif force_text:
        print("Starting chatbot in TEXT mode. Type your messages; type 'stop' to exit.")
        text_mode_flag = True
    elif force_voice:
        print("Starting chatbot in VOICE mode. Say 'stop' to exit.")
        text_mode_flag = False
    else:
        if SR_AVAILABLE:
            print("Starting chatbot with per-turn input choice. You can pick Text or Voice each turn.")
        else:
            print("Starting chatbot in TEXT mode (Voice unavailable). Type your messages; type 'stop' to exit.")
        text_mode_flag = None
    main(text_mode=text_mode_flag)

# ----------------------
# FastAPI integration
# ----------------------
try:
    from fastapi import FastAPI, UploadFile, File
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import Response
    from pydantic import BaseModel
    import base64
    FASTAPI_AVAILABLE = True
except Exception as e:
    FASTAPI_AVAILABLE = False
    print(f"FastAPI not available: {e}")

if FASTAPI_AVAILABLE:
    app = FastAPI(title="Emotion-Aware Chatbot API")

    origins = [
        "http://localhost:8085",
        "http://127.0.0.1:8085",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:8083",
        "http://127.0.0.1:8083",
        "http://localhost:8084",
        "http://127.0.0.1:8084",
    ]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    class ChatRequest(BaseModel):
        message: str
        history: Optional[list[dict]] = None
        tts: Optional[bool] = False

    @app.get("/health")
    async def health():
        return {"status": "ok"}

    # --- Smartwatch OAuth: Google Fit ---
    GOOGLE_AUTH_BASE = "https://accounts.google.com/o/oauth2/v2/auth"
    GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
    GOOGLE_FIT_SCOPE = "https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.heart_rate.read"

    @app.get("/smartwatch/google/auth_url")
    async def smartwatch_google_auth_url():
        if not (SMARTWATCH_GOOGLE_CLIENT_ID and SMARTWATCH_GOOGLE_REDIRECT_URI):
            return {"error": "Smartwatch OAuth not configured"}
        params = {
            "client_id": SMARTWATCH_GOOGLE_CLIENT_ID,
            "redirect_uri": SMARTWATCH_GOOGLE_REDIRECT_URI,
            "response_type": "code",
            "access_type": "offline",
            "prompt": "consent",
            "scope": GOOGLE_FIT_SCOPE,
        }
        # Construct URL manually to ensure spaces in scope become encoded
        import urllib.parse
        q = urllib.parse.urlencode(params, quote_via=urllib.parse.quote)
        return {"url": f"{GOOGLE_AUTH_BASE}?{q}"}

    @app.get("/smartwatch/google/callback")
    async def smartwatch_google_callback(code: str | None = None):
        if not code:
            return {"error": "Missing authorization code"}
        if not (SMARTWATCH_GOOGLE_CLIENT_ID and SMARTWATCH_GOOGLE_CLIENT_SECRET and SMARTWATCH_GOOGLE_REDIRECT_URI):
            return {"error": "Smartwatch OAuth not configured"}
        data = {
            "code": code,
            "client_id": SMARTWATCH_GOOGLE_CLIENT_ID,
            "client_secret": SMARTWATCH_GOOGLE_CLIENT_SECRET,
            "redirect_uri": SMARTWATCH_GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        }
        try:
            resp = requests.post(GOOGLE_TOKEN_URL, data=data, timeout=20)
            token = resp.json()
            # Basic shape: { access_token, refresh_token, expires_in, token_type }
            return token
        except Exception as e:
            return {"error": f"Token exchange failed: {e}"}

    @app.get("/smartwatch/google/activities")
    async def smartwatch_google_activities(access_token: str):
        # Example: fetch latest activity sessions
        headers = {"Authorization": f"Bearer {access_token}"}
        # Google Fit sessions endpoint
        url = "https://www.googleapis.com/fitness/v1/users/me/sessions"
        try:
            r = requests.get(url, headers=headers, timeout=20)
            return r.json()
        except Exception as e:
            return {"error": f"Fetch activities failed: {e}"}

    @app.post("/chat")
    async def chat(req: ChatRequest):
        user_input = req.message.strip()
        if not user_input:
            return {"reply": "", "error": "Empty message"}

        try:
            engine = get_emotion_engine()
            raw_emotions = engine.analyze(user_input)
            top_emotions = engine.synthesize_emotions(raw_emotions)

            timestamp = datetime.utcnow().isoformat()
            try:
                log_emotions_to_csv(timestamp, user_input, top_emotions)
            except Exception as e:
                print(f"CSV log error: {e}")

            hist = req.history or []
            reply = get_chatbot_response(user_input, top_emotions, hist)
        except Exception as e:
            print(f"/chat handler error: {e}")
            # Fallback: neutral tone if anything fails unexpectedly
            reply = generate_offline_response(user_input, "neutral")

        resp = {"reply": reply}
        if req.tts:
            mp3 = tts_mp3_bytes(reply)
            if mp3:
                resp["audio_mp3_base64"] = base64.b64encode(mp3).decode("ascii")
        return resp

    @app.get("/analytics/emotions")
    async def emotions_analytics(limit: int = 50):
        """Return recent emotion logs and aggregates for frontend analytics."""
        filepath_candidates = [
            os.path.join(os.getcwd(), "emotion_log.csv"),
            os.path.join(os.path.dirname(__file__), "..", "emotion_log.csv"),
        ]
        filepath = None
        for p in filepath_candidates:
            if os.path.exists(p):
                filepath = p
                break
        if filepath is None:
            return {"timeline": [], "current": {}, "averages": {}, "error": "emotion_log.csv not found"}

        # Read CSV and build timeline entries
        entries = []
        try:
            with open(filepath, newline="", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    def _to_float(v):
                        try:
                            return float(v) if v not in (None, "") else 0.0
                        except Exception:
                            return 0.0
                    entries.append({
                        "timestamp": row.get("timestamp", ""),
                        "text": row.get("text", ""),
                        "neutral": _to_float(row.get("neutral")),
                        "sadness": _to_float(row.get("sadness")),
                        "fear": _to_float(row.get("fear")),
                        "disgust": _to_float(row.get("disgust")),
                        "surprise": _to_float(row.get("surprise")),
                        "anger": _to_float(row.get("anger")),
                    })
        except Exception as e:
            return {"timeline": [], "current": {}, "averages": {}, "error": f"read_error: {e}"}

        if not entries:
            return {"timeline": [], "current": {}, "averages": {}}

        # Take last N entries
        timeline = entries[-limit:]
        # Current = last entry emotions
        last = timeline[-1]
        current = {k: last.get(k, 0.0) for k in ("neutral","sadness","fear","disgust","surprise","anger")}
        # Averages across timeline
        totals = {k: 0.0 for k in current.keys()}
        for e in timeline:
            for k in totals.keys():
                totals[k] += float(e.get(k, 0.0))
        n = len(timeline)
        averages = {k: (totals[k] / n) if n else 0.0 for k in totals.keys()}

        return {"timeline": timeline, "current": current, "averages": averages}

    @app.post("/voice")
    async def voice(audio: UploadFile = File(...), tts: bool = False):
        try:
            content = await audio.read()
        except Exception as e:
            return {"reply": "", "error": f"Failed to read audio: {e}"}

        # Convert to wav 16k mono using pydub/ffmpeg if needed, then transcribe
        try:
            buf = io.BytesIO(content)
            seg = AudioSegment.from_file(buf)
            seg = seg.set_frame_rate(16000).set_channels(1)
            out = io.BytesIO()
            seg.export(out, format='wav')
            wav_bytes = out.getvalue()
        except Exception as e:
            # If conversion fails, try raw pipeline on original bytes
            print(f"Audio conversion failed, trying raw ASR: {e}")
            wav_bytes = content

        try:
            transcript = get_asr_pipeline()(wav_bytes)["text"].strip()
        except Exception as e:
            return {"reply": "", "error": f"ASR failed: {e}"}

        if not transcript:
            return {"reply": "", "error": "Empty transcript"}

        # Ensure emotion engine is initialized properly
        engine = get_emotion_engine()
        raw_emotions = engine.analyze(transcript)
        top_emotions = engine.synthesize_emotions(raw_emotions)
        timestamp = datetime.utcnow().isoformat()
        try:
            log_emotions_to_csv(timestamp, transcript, top_emotions)
        except Exception as e:
            print(f"CSV log error: {e}")

        reply = get_chatbot_response(transcript, top_emotions, [])
        resp = {"transcript": transcript, "reply": reply}
        if tts:
            mp3 = tts_mp3_bytes(reply)
            if mp3:
                resp["audio_mp3_base64"] = base64.b64encode(mp3).decode("ascii")
        return resp

    @app.post("/tts")
    async def tts(payload: dict):
        text = (payload.get("text") or "").strip()
        if not text:
            return {"error": "Missing text"}
        mp3 = tts_mp3_bytes(text)
        if not mp3:
            return {"error": "TTS generation failed"}
        # Return raw MP3 so client can play via blob URL
        return Response(content=mp3, media_type="audio/mpeg")