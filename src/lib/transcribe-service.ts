// Amazon Transcribe Service - Voice to Text
import { 
  TranscribeClient, 
  StartTranscriptionJobCommand,
  GetTranscriptionJobCommand,
  type TranscriptionJob,
} from '@aws-sdk/client-transcribe';
import { AWS_REGION, TRANSCRIBE_CONFIG } from './aws-config';
import { uploadToS3 } from './s3-service';

const transcribeClient = new TranscribeClient({ region: AWS_REGION });

export interface TranscribeRequest {
  audioFile: File;
  userId: string;
}

export interface TranscribeResponse {
  transcript: string;
  jobName?: string;
  error?: string;
}

// Start transcription job
export const transcribeAudio = async ({
  audioFile,
  userId,
}: TranscribeRequest): Promise<TranscribeResponse> => {
  try {
    // Upload audio to S3 first
    const s3Key = `audio-uploads/${userId}/${Date.now()}-${audioFile.name}`;
    const s3Uri = await uploadToS3(audioFile, s3Key);

    if (!s3Uri) {
      throw new Error('Failed to upload audio to S3');
    }

    // Start transcription job
    const jobName = `transcribe-${userId}-${Date.now()}`;
    
    const command = new StartTranscriptionJobCommand({
      TranscriptionJobName: jobName,
      LanguageCode: TRANSCRIBE_CONFIG.languageCode as any,
      MediaFormat: getMediaFormat(audioFile.name) as any,
      Media: {
        MediaFileUri: s3Uri,
      },
      OutputBucketName: process.env.VITE_S3_AUDIO_BUCKET,
    });

    await transcribeClient.send(command);

    // Poll for completion
    const transcript = await pollTranscriptionJob(jobName);

    return {
      transcript,
      jobName,
    };
  } catch (error: any) {
    console.error('Transcribe error:', error);
    return {
      transcript: '',
      error: error.message || 'Transcription failed',
    };
  }
};

// Poll transcription job until complete
const pollTranscriptionJob = async (
  jobName: string,
  maxAttempts = 30,
  delayMs = 2000
): Promise<string> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const command = new GetTranscriptionJobCommand({
      TranscriptionJobName: jobName,
    });

    const response = await transcribeClient.send(command);
    const job = response.TranscriptionJob;

    if (job?.TranscriptionJobStatus === 'COMPLETED') {
      // Fetch transcript from S3
      const transcriptUri = job.Transcript?.TranscriptFileUri;
      if (transcriptUri) {
        const transcriptResponse = await fetch(transcriptUri);
        const transcriptData = await transcriptResponse.json();
        return transcriptData.results.transcripts[0].transcript;
      }
      throw new Error('Transcript URI not found');
    }

    if (job?.TranscriptionJobStatus === 'FAILED') {
      throw new Error(job.FailureReason || 'Transcription failed');
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  throw new Error('Transcription timeout');
};

// Get media format from file extension
const getMediaFormat = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  const formatMap: Record<string, string> = {
    'mp3': 'mp3',
    'mp4': 'mp4',
    'wav': 'wav',
    'flac': 'flac',
    'ogg': 'ogg',
    'amr': 'amr',
    'webm': 'webm',
  };

  return formatMap[ext || ''] || 'mp3';
};

// Real-time transcription (WebSocket - requires different setup)
export const startRealtimeTranscription = async (
  audioStream: MediaStream,
  onTranscript: (text: string) => void
): Promise<void> => {
  // Note: Real-time transcription requires WebSocket connection
  // This is a placeholder for future implementation
  console.warn('Real-time transcription not yet implemented');
  throw new Error('Real-time transcription requires WebSocket setup');
};
