import dotenv from 'dotenv';

dotenv.config();

export default function apiKeyMiddleware(req, res, next) {
  const configured = process.env.API_KEY;
  const p = req.path || '';
  // Public routes that don't require API key
  if (p.startsWith('/auth/google') || p.startsWith('/auth/callback') || p.startsWith('/auth/refresh') ||
    p.startsWith('/auth/signup') || p.startsWith('/auth/login') || p.startsWith('/fit/') ||
    p.startsWith('/chat') || p.startsWith('/voice') || p.startsWith('/tts')) {
    return next();
  }
  // If no API_KEY is configured, allow requests (you can make this required if preferred)
  if (!configured) return next();

  const sent = req.headers['x-api-key'] || req.query.api_key;
  if (!sent || sent !== configured) return res.status(401).json({ error: 'Invalid or missing API key' });
  return next();
}
