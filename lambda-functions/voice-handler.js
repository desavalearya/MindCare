// Lambda Function: Voice Processing Handler
// Handles voice transcription (Transcribe) and text-to-speech (Polly)

const { 
  TranscribeClient,
  StartTranscriptionJobCommand,
  GetTranscriptionJobCommand
} = require('@aws-sdk/client-transcribe');
const {
  PollyClient,
  SynthesizeSpeechCommand
} = require('@aws-sdk/client-polly');
const {
  S3Client,
  PutObjectCommand
} = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');

const transcribeClient = new TranscribeClient({ region: process.env.AWS_REGION });
const pollyClient = new PollyClient({ region: process.env.AWS_REGION });
const s3Client = new S3Client({ region: process.env.AWS_REGION });

const AUDIO_BUCKET = process.env.S3_AUDIO_BUCKET;

/**
 * Lambda handler for voice operations
 */
exports.handler = async (event) => {
  console.log('Voice Handler Event:', JSON.stringify(event, null, 2));

  const { httpMethod, path, body } = event;
  const parsedBody = body ? JSON.parse(body) : {};

  try {
    if (path === '/voice/transcribe' && httpMethod === 'POST') {
      return await startTranscription(parsedBody);
    }
    
    if (path === '/voice/transcribe/status' && httpMethod === 'GET') {
      return await getTranscriptionStatus(event.queryStringParameters);
    }
    
    if (path === '/voice/synthesize' && httpMethod === 'POST') {
      return await synthesizeSpeech(parsedBody);
    }

    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Route not found' }),
    };
  } catch (error) {
    console.error('Voice Handler Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};

/**
 * Start transcription job
 */
async function startTranscription({ audioFileUri, userId }) {
  const jobName = `transcription-${userId}-${uuidv4()}`;

  const command = new StartTranscriptionJobCommand({
    TranscriptionJobName: jobName,
    LanguageCode: process.env.TRANSCRIBE_LANGUAGE_CODE || 'en-US',
    MediaFormat: 'mp3', // or detect from file extension
    Media: {
      MediaFileUri: audioFileUri,
    },
    OutputBucketName: AUDIO_BUCKET,
    OutputKey: `transcriptions/${jobName}.json`,
  });

  await transcribeClient.send(command);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jobName,
      status: 'IN_PROGRESS',
      message: 'Transcription job started',
    }),
  };
}

/**
 * Get transcription job status
 */
async function getTranscriptionStatus({ jobName }) {
  const command = new GetTranscriptionJobCommand({
    TranscriptionJobName: jobName,
  });

  const response = await transcribeClient.send(command);
  const job = response.TranscriptionJob;

  const result = {
    jobName: job.TranscriptionJobName,
    status: job.TranscriptionJobStatus,
    createdAt: job.CreationTime,
  };

  if (job.TranscriptionJobStatus === 'COMPLETED') {
    result.transcriptFileUri = job.Transcript.TranscriptFileUri;
    
    // Fetch and parse transcript
    const transcriptResponse = await fetch(job.Transcript.TranscriptFileUri);
    const transcriptData = await transcriptResponse.json();
    result.transcript = transcriptData.results.transcripts[0].transcript;
    result.confidence = transcriptData.results.items.reduce((sum, item) => 
      sum + (item.alternatives?.[0]?.confidence || 0), 0
    ) / transcriptData.results.items.length;
  } else if (job.TranscriptionJobStatus === 'FAILED') {
    result.failureReason = job.FailureReason;
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result),
  };
}

/**
 * Synthesize speech from text
 */
async function synthesizeSpeech({ text, voiceId = 'Joanna', userId }) {
  const command = new SynthesizeSpeechCommand({
    Text: text,
    OutputFormat: 'mp3',
    VoiceId: voiceId,
    Engine: 'neural',
    LanguageCode: 'en-US',
  });

  const response = await pollyClient.send(command);
  
  // Save audio to S3
  const audioKey = `synthesized/${userId}/${uuidv4()}.mp3`;
  const audioBuffer = await streamToBuffer(response.AudioStream);
  
  await s3Client.send(new PutObjectCommand({
    Bucket: AUDIO_BUCKET,
    Key: audioKey,
    Body: audioBuffer,
    ContentType: 'audio/mpeg',
  }));

  const audioUrl = `https://${AUDIO_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${audioKey}`;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      audioUrl,
      audioKey,
      voiceId,
      text: text.substring(0, 100), // Return first 100 chars for reference
    }),
  };
}

/**
 * Convert stream to buffer
 */
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
