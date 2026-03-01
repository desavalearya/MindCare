import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import path, { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initDb, db } from './db/index.js';
import apiKeyMiddleware from './middleware/apiKey.js';
import bcrypt from 'bcryptjs';
import axios from 'axios';

{
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.join(__dirname, '.env'),
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), 'server', '.env')
  ];
  for (const p of candidates) {
    if (existsSync(p)) {
      dotenv.config({ path: p });
      break;
    }
  }
}

const app = express();
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman, same-origin proxy)
    if (!origin) return callback(null, true);
    // Allow any localhost / 127.0.0.1 origin on any port
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: false,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use DB module and API-key middleware
// The `db` object (db.pool) will be initialized by `initDb()` before the server starts.
app.use(apiKeyMiddleware);

// Health check
app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'mindmate-auth-api' });
});

const OAUTH_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '55279401354-t5fclp8n2hj6ipu33jhbeurp0jddh4ig.apps.googleusercontent.com';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://127.0.0.1:8083/auth/callback';
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.heart_rate.read',
  'https://www.googleapis.com/auth/fitness.sleep.read',
  'https://www.googleapis.com/auth/fitness.body.read',
].join(' ');
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

app.get('/auth/google', (req, res) => {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: GOOGLE_SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
  });
  res.redirect(`${OAUTH_AUTH_URL}?${params.toString()}`);
});

app.get('/auth/callback', async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).send('Missing code');

    const params = new URLSearchParams({
      code: String(code),
      client_id: GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    const tokenResp = await axios.post(TOKEN_URL, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    res.json(tokenResp.data);
  } catch (err) {
    const data = err?.response?.data;
    console.error(data || err);
    res.status(500).send('Token exchange failed');
  }
});

app.post('/auth/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body || {};
    if (!refresh_token) return res.status(400).send('Missing refresh_token');

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      refresh_token: String(refresh_token),
      grant_type: 'refresh_token',
    });

    const resp = await axios.post(TOKEN_URL, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    res.json(resp.data);
  } catch (err) {
    const data = err?.response?.data;
    console.error(data || err);
    res.status(500).send('Refresh failed');
  }
});

export async function callGoogleFitEndpoint(accessToken, method, url, data = {}) {
  return axios({
    method,
    url,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    data,
  });
}

app.get('/fit/steps', async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).send('No access token');

    const now = Date.now();
    const body = {
      aggregateBy: [{ dataTypeName: 'com.google.step_count.delta' }],
      bucketByTime: { durationMillis: 86400000 },
      startTimeMillis: now - 86400000,
      endTimeMillis: now,
    };

    const fitResp = await callGoogleFitEndpoint(token, 'post', 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', body);
    res.json(fitResp.data);
  } catch (err) {
    const data = err?.response?.data;
    console.error(data || err);
    res.status(500).send('Failed to fetch steps');
  }
});

app.get('/fit/heartrate', async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).send('No access token');

    const now = Date.now();
    const body = {
      aggregateBy: [{ dataTypeName: 'com.google.heart_rate.bpm' }],
      bucketByTime: { durationMillis: 3600000 },
      startTimeMillis: now - 86400000,
      endTimeMillis: now,
    };

    const fitResp = await callGoogleFitEndpoint(token, 'post', 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', body);
    res.json(fitResp.data);
  } catch (err) {
    const data = err?.response?.data;
    console.error(data || err);
    res.status(500).send('Failed to fetch heart rate');
  }
});

app.get('/fit/sleep', async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).send('No access token');

    const url = 'https://www.googleapis.com/fitness/v1/users/me/sessions?activityType=72';
    const resp = await callGoogleFitEndpoint(token, 'get', url);
    res.json(resp.data);
  } catch (err) {
    const data = err?.response?.data;
    console.error(data || err);
    res.status(500).send('Failed to fetch sleep sessions');
  }
});

// Counsellor sign up
app.post('/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing required fields' });
    const userRole = role === 'counsellor' ? 'counsellor' : 'user';

    const [rows] = await db.pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (Array.isArray(rows) && rows.length > 0) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 12);
    await db.pool.query('INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)', [name, email, hash, userRole]);
    return res.json({ email, localId: `db:${email}`, displayName: name, role: userRole });
  } catch (e) {
    console.error('Signup error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login (user/counsellor/admin)
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body || {};
    console.log(`Login attempt: email=${email}, role=${role}`);

    if (!email || !password) {
      console.log('Login failed: Missing email or password');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [rows] = await db.pool.query('SELECT name, email, password, role FROM users WHERE email = ?', [email]);
    const user = Array.isArray(rows) && rows[0];

    if (!user) {
      console.log(`Login failed: Account not found for ${email}`);
      return res.status(404).json({ error: 'Account not found' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      console.log(`Login failed: Invalid credentials for ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (role && !['user', 'counsellor', 'admin'].includes(role)) {
      console.log(`Login failed: Invalid role ${role}`);
      return res.status(400).json({ error: 'Invalid role' });
    }

    if (role && role !== user.role) {
      console.log(`Login failed: Role mismatch for ${email}. Expected ${role}, DB has ${user.role}`);
      return res.status(400).json({ error: `Account exists but role is ${user.role}` });
    }

    console.log(`Login success: ${email}`);
    return res.json({ email: user.email, displayName: user.name, localId: `db:${user.email}`, role: user.role });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// AI Chatbot Endpoints
// ============================================

// Simple rule-based chatbot for mental health support
function generateChatResponse(message, persona = 'calm') {
  const msg = message.toLowerCase();

  // Emotion detection patterns
  const emotions = {
    anxious: ['anxious', 'anxiety', 'worried', 'nervous', 'stress', 'stressed', 'panic'],
    sad: ['sad', 'depressed', 'down', 'unhappy', 'crying', 'low', 'hopeless'],
    happy: ['happy', 'great', 'good', 'wonderful', 'excited', 'joyful', 'amazing'],
    angry: ['angry', 'frustrated', 'mad', 'annoyed', 'irritated', 'furious'],
    tired: ['tired', 'exhausted', 'fatigue', 'sleepy', 'drained', 'worn out'],
    lonely: ['lonely', 'alone', 'isolated', 'disconnected', 'solitary'],
  };

  // Detect emotion
  let detectedEmotion = null;
  for (const [emotion, keywords] of Object.entries(emotions)) {
    if (keywords.some(kw => msg.includes(kw))) {
      detectedEmotion = emotion;
      break;
    }
  }

  // Persona-specific response templates
  const responses = {
    calm: {
      anxious: [
        "I hear that you're feeling anxious. Let's take a moment together. Try taking three deep breaths - breathe in for 4 counts, hold for 4, and exhale for 6. You're safe right now.",
        "Anxiety can feel overwhelming, but you're not alone in this. What helps you feel grounded? Sometimes focusing on what we can control in this moment brings peace.",
        "Your feelings are valid. When anxiety visits, remember it's temporary. Would you like to try a calming breathing exercise with me?"
      ],
      sad: [
        "I'm here with you during this difficult time. Sadness is a natural emotion, and it's okay to feel this way. What small thing might bring you a moment of comfort today?",
        "It takes courage to acknowledge sadness. Remember, these feelings will pass. Is there something specific weighing on your heart?",
        "I'm glad you shared this with me. Even in sadness, you're showing strength by reaching out. What would self-compassion look like for you right now?"
      ],
      happy: [
        "That's wonderful to hear! Your joy is beautiful. What's contributing to these positive feelings?",
        "I'm so glad you're feeling this way. Savoring these happy moments helps build resilience. What makes this moment special for you?",
        "Your happiness is a gift. Taking time to appreciate these feelings strengthens our wellbeing. What are you grateful for today?"
      ],
      angry: [
        "I understand you're feeling angry. Your feelings matter. What would feel helpful right now - talking through it or taking a moment to cool down?",
        "Anger often protects other feelings underneath. When you're ready, we can explore what might be at the root of this. You're in a safe space here.",
        "It's okay to feel angry. Let's channel this energy constructively. What boundary might need to be set or what needs to be expressed?"
      ],
      tired: [
        "Exhaustion is your body's way of asking for care. What rest would feel most nourishing to you right now?",
        "Being tired affects everything. Have you been able to prioritize rest lately? Even small moments of pause can help.",
        "Your energy is precious. What's one thing you could let go of today to create space for rest?"
      ],
      lonely: [
        "Loneliness is painful, and I'm here with you now. Connection starts with small steps. What's one tiny way you might reach out today?",
        "Feeling alone is hard. Remember, this feeling doesn't define your worth. You matter, and you're deserving of connection.",
        "I hear you. Even when we feel most alone, we're never truly isolated. What used to help you feel connected?"
      ],
      greeting: [
        "Hello! I'm here to support you with calm and presence. How are you feeling today?",
        "Welcome. Take a deep breath and settle in. I'm here to listen. What's on your mind?",
        "Hi there. This is a safe space for you. What would you like to talk about today?"
      ],
      gratitude: [
        "You're very welcome. It's an honor to support you on your journey.",
        "I'm here whenever you need. Take care of yourself.",
        "Thank you for sharing with me. Remember, you're doing better than you think."
      ],
      default: [
        "I'm listening. Tell me more about what's on your mind.",
        "That sounds important. How does that make you feel?",
        "I'm here for you. Would you like to explore that further?",
        "Your thoughts and feelings matter. What's the most pressing thing for you right now?"
      ]
    },
    motivational: {
      anxious: [
        "You've got this! Anxiety might feel big right now, but YOU are bigger. You've overcome challenges before, and you'll overcome this too. What's one small win you can achieve today?",
        "Channel that nervous energy into action! What's ONE thing you can control right now? Start there. Progress, not perfection!",
        "Tough times don't last, but tough people do! You're stronger than your anxiety. Let's break this down into manageable steps. What's step one?"
      ],
      sad: [
        "I see your strength even in sadness! Every emotion is temporary - this will pass. What's one small positive action you can take today?",
        "You're a warrior, even when you don't feel like it. This sadness won't define you. What goal, no matter how small, can you focus on?",
        "Every champion faces setbacks. This is your comeback story! What's one thing that usually lifts your spirits? Let's try it!"
      ],
      happy: [
        "YES! This is the energy! Ride this wave and use it to push forward. What amazing thing will you accomplish with this momentum?",
        "That's what I'm talking about! Happiness fuels success. What goal can you crush while you're feeling this good?",
        "You're unstoppable when you feel like this! Let's harness this positivity. What's your next big move?"
      ],
      angry: [
        "Turn that fire into fuel! Anger can be incredibly motivating. What challenge can you absolutely demolish with this energy?",
        "You've got POWER right now - let's use it wisely! What boundary needs to be set? What problem needs solving?",
        "Champions channel anger into achievement. What constructive action can you take? Let's transform this emotion into your superpower!"
      ],
      tired: [
        "Even heroes need to recharge! Rest is PRODUCTIVE. What's your recovery plan? Champions know when to rest to come back stronger!",
        "Fatigue means you've been giving it your all! Now it's time to refuel. What self-care will power your comeback?",
        "Real strength is knowing when to pause. What energizes you? Let's make a plan to get your mojo back!"
      ],
      lonely: [
        "You're never truly alone - you have YOU, and that's powerful! What's one brave step you can take to connect today?",
        "This is your opportunity for growth! Sometimes we need solitude to discover our strength. What goal can you focus on?",
        "Connection starts with self-love. You're worthy of amazing relationships! What's one thing you'll do today to put yourself out there?"
      ],
      greeting: [
        "Hey champion! Ready to make today count? What amazing things are we accomplishing together?",
        "Welcome back, superstar! What goals are we crushing today?",
        "Let's GO! What challenge are you ready to tackle? You've got this!"
      ],
      gratitude: [
        "That's the spirit! Keep up that positive energy! You're on your way to greatness!",
        "You're awesome! Now go out there and show the world what you're made of!",
        "Remember - you're capable of incredible things! Believe in yourself!"
      ],
      default: [
        "I'm all ears! Let's turn any challenge into an opportunity. What's going on?",
        "Talk to me! Every problem has a solution, and you're strong enough to find it. What's up?",
        "I'm here to help you level up! What do you want to work on?"
      ]
    },
    friendly: {
      anxious: [
        "Hey, I totally get it - anxiety is so tough! You know what? We're going to get through this together. Want to try something that helps me? Deep breaths and thinking of three things I can see, hear, and touch.",
        "Aw, friend, I'm sorry you're feeling anxious. That's really hard! How about we chat about what's worrying you? Sometimes just talking helps!",
        "I'm right here with you! Anxiety is the worst, but you're not alone. Want to distract yourself for a bit and talk about something that makes you smile?"
      ],
      sad: [
        "Oh friend, I'm so sorry you're feeling down. Sending you the biggest virtual hug! Want to talk about it, or would you prefer a distraction?",
        "I'm here for you, and I care about how you're feeling. Sadness is totally okay - we all have those days! What sounds comforting to you right now?",
        "Hey, rough day vibes? I get it. You don't have to go through this alone. I'm here whenever you need to talk, vent, or just have someone listen."
      ],
      happy: [
        "Yay! I'm so happy for you! Your joy is contagious! Tell me all about it - what's making you feel so great?",
        "This is amazing! I love when you're happy! Let's celebrate this moment together. What's bringing you this sunshine?",
        "Yes! Your happiness makes my day! Keep that beautiful energy going! What's the best part of your day?"
      ],
      angry: [
        "Oof, I hear you - that sounds really frustrating! Want to vent about it? I'm all ears, and I won't judge!",
        "Hey, it's totally okay to be angry! Let it out! What happened? Sometimes it helps to just get it all out there.",
        "That sounds really tough! I'm sorry you're going through this. Want to talk about it or maybe think about what might help you feel better?"
      ],
      tired: [
        "Oh man, I feel you! Being tired is so draining (literally!). Have you been able to rest enough? What sounds good - a nap, some quiet time, or just a chill chat?",
        "Aw, sounds like you need some serious self-care! What usually helps you recharge? Maybe we can figure out how to get you some rest!",
        "I totally get it - exhaustion is real! You deserve rest, friend. What's one little thing that might help you feel a bit more energized?"
      ],
      lonely: [
        "Hey, I'm here with you right now, and I'm glad we're talking! Loneliness is hard, but you're not alone - I'm your buddy! Want to chat about anything?",
        "I'm sorry you're feeling lonely, friend. That's really tough! But hey, I'm here and I care! What would make you feel more connected right now?",
        "Sending warmth your way! You've got a friend in me. Sometimes loneliness just needs a good conversation - I'm all yours! What's going on?"
      ],
      greeting: [
        "Hey there, friend! So good to see you! How's your day going? I'm all ears!",
        "Hi! Welcome back! I'm so glad you're here! What's new with you today?",
        "Hello, lovely human! How are you feeling today? I'm here if you want to chat about anything!"
      ],
      gratitude: [
        "Aw, you're so welcome! That's what friends are for! Take care of yourself!",
        "Anytime, buddy! I'm always here when you need me. You're awesome!",
        "Of course! Hey, remember - you're doing great! I'm proud of you!"
      ],
      default: [
        "I'm listening, friend! What's on your mind? No judgment here, just support!",
        "Tell me more! I'm really interested in how you're feeling. What's going on?",
        "I'm here for whatever you need - support, advice, or just someone to listen! What's up?"
      ]
    }
  };

  // Select response category
  let category = 'default';
  if (detectedEmotion) {
    category = detectedEmotion;
  } else if (msg.match(/\b(hi|hello|hey|good morning|good afternoon|good evening)\b/)) {
    category = 'greeting';
  } else if (msg.match(/\b(thank|thanks|appreciate|grateful)\b/)) {
    category = 'gratitude';
  }

  // Get random response from selected category and persona
  const personaResponses = responses[persona] || responses.calm;
  const categoryResponses = personaResponses[category] || personaResponses.default;
  const randomIndex = Math.floor(Math.random() * categoryResponses.length);

  return categoryResponses[randomIndex];
}

// POST /chat - Text chat endpoint
app.post('/chat', (req, res) => {
  try {
    const { message, persona = 'calm' } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const reply = generateChatResponse(message, persona);
    return res.json({ reply });
  } catch (e) {
    console.error('Chat error:', e);
    return res.status(500).json({ error: 'Chat processing failed' });
  }
});

// POST /voice - Voice input endpoint (placeholder)
app.post('/voice', (req, res) => {
  try {
    // In a full implementation, this would process audio using speech-to-text
    // For now, returning a placeholder response
    return res.json({
      transcript: 'Voice input received',
      reply: "I received your voice message! Voice-to-text is currently in development. Please use text input for now."
    });
  } catch (e) {
    console.error('Voice error:', e);
    return res.status(500).json({ error: 'Voice processing failed' });
  }
});

// POST /tts - Text-to-speech endpoint (placeholder)
app.post('/tts', (req, res) => {
  try {
    // In a full implementation, this would generate audio from text
    // For now, returning empty audio or error
    // Browser's built-in TTS can be used on frontend as alternative
    return res.status(501).json({ error: 'TTS not implemented - use browser TTS' });
  } catch (e) {
    console.error('TTS error:', e);
    return res.status(500).json({ error: 'TTS failed' });
  }
});

const PORT = process.env.PORT || 8083;
initDb()
  .then(() => app.listen(PORT, () => console.log(`Auth API listening on http://127.0.0.1:${PORT}`)))
  .catch((e) => {
    console.error('Failed to initialize DB:', e);
    process.exit(1);
  });
