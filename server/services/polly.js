// Backend Polly Service
import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const pollyClient = new PollyClient({ 
  region: process.env.AWS_REGION || 'us-east-1' 
});

const s3Client = new S3Client({ 
  region: process.env.AWS_REGION || 'us-east-1' 
});

/**
 * Convert text to speech and upload to S3
 * @param {string} text - Text to convert
 * @param {string} userId - User ID for S3 path
 * @param {Object} options - Voice options
 * @returns {Promise<Object>} Audio URL and metadata
 */
export async function textToSpeech(text, userId, options = {}) {
  try {
    const {
      voiceId = process.env.POLLY_VOICE_ID || 'Joanna',
      engine = process.env.POLLY_ENGINE || 'neural',
    } = options;

    // Synthesize speech
    const command = new SynthesizeSpeechCommand({
      Text: text,
      OutputFormat: 'mp3',
      VoiceId: voiceId,
      Engine: engine,
      LanguageCode: 'en-US',
      TextType: 'text',
    });

    const response = await pollyClient.send(command);

    if (!response.AudioStream) {
      throw new Error('No audio stream received');
    }

    // Convert stream to buffer
    const audioBuffer = await streamToBuffer(response.AudioStream);

    // Upload to S3
    const s3Key = `tts-output/${userId}/${Date.now()}.mp3`;
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.S3_AUDIO_BUCKET,
      Key: s3Key,
      Body: audioBuffer,
      ContentType: 'audio/mpeg',
    });

    await s3Client.send(uploadCommand);

    // Generate pre-signed URL
    const getCommand = new PutObjectCommand({
      Bucket: process.env.S3_AUDIO_BUCKET,
      Key: s3Key,
    });

    const audioUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });

    return {
      success: true,
      audioUrl,
      s3Key,
      duration: response.RequestCharacters,
    };
  } catch (error) {
    console.error('Polly TTS error:', error);
    return {
      success: false,
      error: error.message || 'Text-to-speech failed',
    };
  }
}

/**
 * Convert text to speech and return audio buffer directly
 * @param {string} text - Text to convert
 * @param {Object} options - Voice options
 * @returns {Promise<Object>} Audio buffer and metadata
 */
export async function textToSpeechBuffer(text, options = {}) {
  try {
    const {
      voiceId = process.env.POLLY_VOICE_ID || 'Joanna',
      engine = process.env.POLLY_ENGINE || 'neural',
    } = options;

    const command = new SynthesizeSpeechCommand({
      Text: text,
      OutputFormat: 'mp3',
      VoiceId: voiceId,
      Engine: engine,
      LanguageCode: 'en-US',
      TextType: 'text',
    });

    const response = await pollyClient.send(command);

    if (!response.AudioStream) {
      throw new Error('No audio stream received');
    }

    const audioBuffer = await streamToBuffer(response.AudioStream);

    return {
      success: true,
      audioBuffer,
      contentType: 'audio/mpeg',
    };
  } catch (error) {
    console.error('Polly TTS buffer error:', error);
    return {
      success: false,
      error: error.message || 'Text-to-speech failed',
    };
  }
}

/**
 * Convert stream to buffer
 * @param {ReadableStream} stream - Audio stream
 * @returns {Promise<Buffer>} Audio buffer
 */
async function streamToBuffer(stream) {
  const chunks = [];
  
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  
  return Buffer.concat(chunks);
}

/**
 * Get available voices
 * @returns {Object} Available voices by category
 */
export function getAvailableVoices() {
  return {
    english: [
      { id: 'Joanna', name: 'Joanna (Female, US)', gender: 'Female', language: 'en-US' },
      { id: 'Matthew', name: 'Matthew (Male, US)', gender: 'Male', language: 'en-US' },
      { id: 'Salli', name: 'Salli (Female, US)', gender: 'Female', language: 'en-US' },
      { id: 'Joey', name: 'Joey (Male, US)', gender: 'Male', language: 'en-US' },
      { id: 'Amy', name: 'Amy (Female, UK)', gender: 'Female', language: 'en-GB' },
      { id: 'Brian', name: 'Brian (Male, UK)', gender: 'Male', language: 'en-GB' },
    ],
    neural: [
      { id: 'Joanna', name: 'Joanna Neural (Female, US)', gender: 'Female', language: 'en-US', engine: 'neural' },
      { id: 'Matthew', name: 'Matthew Neural (Male, US)', gender: 'Male', language: 'en-US', engine: 'neural' },
      { id: 'Ruth', name: 'Ruth Neural (Female, US)', gender: 'Female', language: 'en-US', engine: 'neural' },
      { id: 'Stephen', name: 'Stephen Neural (Male, US)', gender: 'Male', language: 'en-US', engine: 'neural' },
    ],
  };
}
