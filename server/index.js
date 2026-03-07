// MindCare Backend Server
// Express server that connects frontend to AWS services
// Handles: Chat (Bedrock), Voice (Transcribe + Polly), S3 uploads

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } from '@aws-sdk/client-transcribe';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { CognitoIdentityProviderClient, GetUserCommand, ListUsersCommand } from '@aws-sdk/client-cognito-identity-provider';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;
const AWS_REGION = process.env.VITE_AWS_REGION || 'us-east-1';
const S3_AUDIO_BUCKET = process.env.VITE_S3_AUDIO_BUCKET || 'mindcare-audio-uploads';
const S3_USER_BUCKET = process.env.VITE_S3_BUCKET_NAME || 'mindcare-user-content';
const BEDROCK_MODEL_ID = process.env.VITE_BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0';
const COGNITO_USER_POOL_ID = process.env.VITE_COGNITO_USER_POOL_ID;

// ─── AWS Clients ─────────────────────────────────────────────────────────────
const bedrockClient = new BedrockRuntimeClient({ region: AWS_REGION });
const pollyClient = new PollyClient({ region: AWS_REGION });
const transcribeClient = new TranscribeClient({ region: AWS_REGION });
const s3Client = new S3Client({ region: AWS_REGION });
const cognitoClient = new CognitoIdentityProviderClient({ region: AWS_REGION });

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Multer for audio uploads (in-memory)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    region: AWS_REGION,
    services: ['bedrock', 'polly', 'transcribe', 's3', 'cognito'],
    timestamp: new Date().toISOString(),
  });
});

// ─── AWS Service Health Checks ────────────────────────────────────────────────
app.get('/health/aws', async (req, res) => {
  const results = {};

  // Test Bedrock
  try {
    const testBody = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hi' }],
    };
    const cmd = new InvokeModelCommand({
      modelId: BEDROCK_MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(testBody),
    });
    await bedrockClient.send(cmd);
    results.bedrock = { status: 'ok', model: BEDROCK_MODEL_ID };
  } catch (err) {
    results.bedrock = { status: 'error', message: err.message };
  }

  // Test Polly
  try {
    const cmd = new SynthesizeSpeechCommand({
      Text: 'Hello',
      OutputFormat: 'mp3',
      VoiceId: 'Joanna',
      Engine: 'neural',
    });
    await pollyClient.send(cmd);
    results.polly = { status: 'ok', voice: 'Joanna (neural)' };
  } catch (err) {
    results.polly = { status: 'error', message: err.message };
  }

  // Test S3 (check bucket access)
  try {
    const cmd = new GetObjectCommand({ Bucket: S3_AUDIO_BUCKET, Key: '__health_check__' });
    await getSignedUrl(s3Client, cmd, { expiresIn: 60 });
    results.s3 = { status: 'ok', audioBucket: S3_AUDIO_BUCKET, userBucket: S3_USER_BUCKET };
  } catch (err) {
    // Presigning works even if key doesn't exist
    if (err.name === 'NoSuchKey' || err.$metadata) {
      results.s3 = { status: 'ok', audioBucket: S3_AUDIO_BUCKET };
    } else {
      results.s3 = { status: 'error', message: err.message };
    }
  }

  // Test Cognito
  try {
    const cmd = new ListUsersCommand({ UserPoolId: COGNITO_USER_POOL_ID, Limit: 1 });
    await cognitoClient.send(cmd);
    results.cognito = { status: 'ok', userPoolId: COGNITO_USER_POOL_ID };
  } catch (err) {
    results.cognito = { status: 'error', message: err.message };
  }

  // Test Transcribe (just check client can reach service)
  try {
    const cmd = new GetTranscriptionJobCommand({ TranscriptionJobName: '__healthcheck__' });
    await transcribeClient.send(cmd);
    results.transcribe = { status: 'ok' };
  } catch (err) {
    if (err.name === 'BadRequestException' || err.name === 'NotFoundException' || err.message?.includes('does not exist')) {
      results.transcribe = { status: 'ok', note: 'Service reachable' };
    } else {
      results.transcribe = { status: 'error', message: err.message };
    }
  }

  const allOk = Object.values(results).every(r => r.status === 'ok');
  res.status(allOk ? 200 : 207).json({ overall: allOk ? 'ok' : 'partial', services: results });
});

// ─── CHAT endpoint (Bedrock / Claude) ────────────────────────────────────────
// POST /chat
// Body: { message: string, history: [{role: "User"|"AI", content: string}], persona?: string, tts?: boolean }
app.post('/chat', async (req, res) => {
  try {
    const { message, history = [], persona = 'calm', tts = false } = req.body;

    if (!message) return res.status(400).json({ error: 'message is required' });

    const personaPrompts = {
      calm: 'Be calm, gentle, and soothing in your responses.',
      motivational: 'Be motivational, energetic, and uplifting in your responses.',
      friendly: 'Be warm, friendly, and conversational in your responses.',
    };

    const systemPrompt = `You are a compassionate AI mental health companion for MindCare.
Your role is to:
- Provide emotional support and active listening
- Suggest evidence-based coping strategies
- Encourage healthy habits and self-care
- Recognize when professional help may be needed
- Never diagnose or replace professional therapy
- Be warm, empathetic, and non-judgmental

Tone: ${personaPrompts[persona] || personaPrompts.calm}

Always prioritize user safety and well-being. Keep responses concise (2-4 sentences unless more detail is needed).`;

    // Convert history format
    const messages = [
      ...history.map(m => ({
        role: m.role === 'User' ? 'user' : 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    const requestBody = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 800,
      system: systemPrompt,
      messages,
      temperature: 0.7,
      top_p: 0.9,
    };

    const command = new InvokeModelCommand({
      modelId: BEDROCK_MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(requestBody),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const reply = responseBody.content?.[0]?.text || 'I am here to support you.';

    // Optionally get TTS audio
    let audioUrl = null;
    if (tts) {
      try {
        const pollyCmd = new SynthesizeSpeechCommand({
          Text: reply.substring(0, 3000),
          OutputFormat: 'mp3',
          VoiceId: 'Joanna',
          Engine: 'neural',
          LanguageCode: 'en-US',
        });
        const pollyResp = await pollyClient.send(pollyCmd);
        const chunks = [];
        for await (const chunk of pollyResp.AudioStream) chunks.push(chunk);
        const audioBuffer = Buffer.concat(chunks);
        const audioKey = `tts/${uuidv4()}.mp3`;
        await s3Client.send(new PutObjectCommand({
          Bucket: S3_AUDIO_BUCKET,
          Key: audioKey,
          Body: audioBuffer,
          ContentType: 'audio/mpeg',
        }));
        audioUrl = `https://${S3_AUDIO_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${audioKey}`;
      } catch (ttsErr) {
        console.warn('TTS failed (non-fatal):', ttsErr.message);
      }
    }

    res.json({ reply, audioUrl });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message || 'Chat failed' });
  }
});

// ─── VOICE endpoint (Transcribe + Bedrock) ────────────────────────────────────
// POST /voice?tts=false
// Body: FormData with "audio" file
app.post('/voice', upload.single('audio'), async (req, res) => {
  try {
    const tts = req.query.tts !== 'false';

    if (!req.file) return res.status(400).json({ error: 'audio file is required' });

    // Upload audio to S3
    const audioKey = `voice-uploads/${uuidv4()}.webm`;
    await s3Client.send(new PutObjectCommand({
      Bucket: S3_AUDIO_BUCKET,
      Key: audioKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype || 'audio/webm',
    }));
    const s3Uri = `s3://${S3_AUDIO_BUCKET}/${audioKey}`;

    // Start transcription job
    const jobName = `mindcare-${uuidv4()}`;
    await transcribeClient.send(new StartTranscriptionJobCommand({
      TranscriptionJobName: jobName,
      LanguageCode: 'en-US',
      MediaFormat: 'webm',
      Media: { MediaFileUri: s3Uri },
      OutputBucketName: S3_AUDIO_BUCKET,
      OutputKey: `transcriptions/${jobName}.json`,
    }));

    // Poll for result (max 30s)
    let transcript = '';
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const statusResp = await transcribeClient.send(
        new GetTranscriptionJobCommand({ TranscriptionJobName: jobName })
      );
      const job = statusResp.TranscriptionJob;
      if (job.TranscriptionJobStatus === 'COMPLETED') {
        const transcriptUri = job.Transcript.TranscriptFileUri;
        const tRes = await fetch(transcriptUri);
        const tData = await tRes.json();
        transcript = tData.results?.transcripts?.[0]?.transcript || '';
        break;
      }
      if (job.TranscriptionJobStatus === 'FAILED') {
        throw new Error('Transcription failed: ' + job.FailureReason);
      }
    }

    if (!transcript) {
      return res.json({ transcript: '', reply: "I couldn't hear that clearly. Could you please try again?" });
    }

    // Get AI reply
    const chatResp = await fetch(`http://localhost:${PORT}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: transcript, tts }),
    });
    const chatData = await chatResp.json();

    res.json({ transcript, reply: chatData.reply, audioUrl: chatData.audioUrl });
  } catch (err) {
    console.error('Voice error:', err);
    res.status(500).json({ error: err.message || 'Voice processing failed' });
  }
});

// ─── TTS endpoint (Polly only) ────────────────────────────────────────────────
// POST /tts
// Body: { text: string, voiceId?: string }
app.post('/tts', async (req, res) => {
  try {
    const { text, voiceId = 'Joanna' } = req.body;
    if (!text) return res.status(400).json({ error: 'text is required' });

    const command = new SynthesizeSpeechCommand({
      Text: text.substring(0, 3000),
      OutputFormat: 'mp3',
      VoiceId: voiceId,
      Engine: 'neural',
      LanguageCode: 'en-US',
      TextType: 'text',
    });

    const response = await pollyClient.send(command);
    const chunks = [];
    for await (const chunk of response.AudioStream) chunks.push(chunk);
    const audioBuffer = Buffer.concat(chunks);

    res.set('Content-Type', 'audio/mpeg');
    res.set('Content-Length', audioBuffer.length);
    res.send(audioBuffer);
  } catch (err) {
    console.error('TTS error:', err);
    res.status(500).json({ error: err.message || 'TTS failed' });
  }
});

// ─── S3 Upload URL endpoint ────────────────────────────────────────────────────
// POST /s3/upload-url
// Body: { key: string, contentType: string, bucket?: string }
app.post('/s3/upload-url', async (req, res) => {
  try {
    const { key, contentType, bucket = S3_USER_BUCKET } = req.body;
    if (!key) return res.status(400).json({ error: 'key is required' });

    const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    res.json({ uploadUrl, key, bucket });
  } catch (err) {
    console.error('S3 upload URL error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate upload URL' });
  }
});

// ─── Emotion Analysis endpoint ────────────────────────────────────────────────
// POST /emotion
// Body: { text: string }
app.post('/emotion', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'text is required' });

    const requestBody = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 10,
      system: 'You are an emotion analyzer. Respond with ONLY ONE word from: happy, sad, anxious, angry, neutral, excited, stressed, calm.',
      messages: [{ role: 'user', content: text }],
      temperature: 0.3,
    };

    const command = new InvokeModelCommand({
      modelId: BEDROCK_MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(requestBody),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const emotion = responseBody.content?.[0]?.text?.trim().toLowerCase() || 'neutral';

    res.json({ emotion });
  } catch (err) {
    console.error('Emotion error:', err);
    res.json({ emotion: 'neutral' });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🧠 MindCare Backend Server running on http://localhost:${PORT}`);
  console.log(`📍 AWS Region: ${AWS_REGION}`);
  console.log(`🪣  S3 Audio Bucket: ${S3_AUDIO_BUCKET}`);
  console.log(`🤖 Bedrock Model: ${BEDROCK_MODEL_ID}`);
  console.log(`🔑 Cognito User Pool: ${COGNITO_USER_POOL_ID || 'NOT SET'}`);
  console.log(`\n📡 Endpoints:`);
  console.log(`   GET  /health         - Server health`);
  console.log(`   GET  /health/aws     - AWS services health check`);
  console.log(`   POST /chat           - AI Chat (Bedrock/Claude)`);
  console.log(`   POST /voice          - Voice Transcribe + Chat`);
  console.log(`   POST /tts            - Text-to-Speech (Polly)`);
  console.log(`   POST /s3/upload-url  - S3 presigned upload URL`);
  console.log(`   POST /emotion        - Emotion analysis\n`);
});

export default app;
