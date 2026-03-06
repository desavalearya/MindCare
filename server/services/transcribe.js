// Backend Transcribe Service
import { 
  TranscribeClient, 
  StartTranscriptionJobCommand,
  GetTranscriptionJobCommand,
} from '@aws-sdk/client-transcribe';

const transcribeClient = new TranscribeClient({ 
  region: process.env.AWS_REGION || 'us-east-1' 
});

/**
 * Start transcription job
 * @param {string} s3Uri - S3 URI of audio file
 * @param {string} jobName - Unique job name
 * @returns {Promise<Object>} Job details
 */
export async function startTranscription(s3Uri, jobName) {
  try {
    const command = new StartTranscriptionJobCommand({
      TranscriptionJobName: jobName,
      LanguageCode: process.env.TRANSCRIBE_LANGUAGE_CODE || 'en-US',
      MediaFormat: getMediaFormatFromUri(s3Uri),
      Media: {
        MediaFileUri: s3Uri,
      },
      OutputBucketName: process.env.S3_AUDIO_BUCKET,
    });

    const response = await transcribeClient.send(command);

    return {
      success: true,
      jobName: response.TranscriptionJob.TranscriptionJobName,
      status: response.TranscriptionJob.TranscriptionJobStatus,
    };
  } catch (error) {
    console.error('Start transcription error:', error);
    return {
      success: false,
      error: error.message || 'Failed to start transcription',
    };
  }
}

/**
 * Get transcription job status and result
 * @param {string} jobName - Job name
 * @returns {Promise<Object>} Job status and transcript
 */
export async function getTranscriptionResult(jobName) {
  try {
    const command = new GetTranscriptionJobCommand({
      TranscriptionJobName: jobName,
    });

    const response = await transcribeClient.send(command);
    const job = response.TranscriptionJob;

    if (job.TranscriptionJobStatus === 'COMPLETED') {
      // Fetch transcript from S3
      const transcriptUri = job.Transcript.TranscriptFileUri;
      const transcriptResponse = await fetch(transcriptUri);
      const transcriptData = await transcriptResponse.json();

      return {
        success: true,
        status: 'COMPLETED',
        transcript: transcriptData.results.transcripts[0].transcript,
        confidence: calculateAverageConfidence(transcriptData.results.items),
      };
    }

    if (job.TranscriptionJobStatus === 'FAILED') {
      return {
        success: false,
        status: 'FAILED',
        error: job.FailureReason || 'Transcription failed',
      };
    }

    return {
      success: true,
      status: job.TranscriptionJobStatus,
    };
  } catch (error) {
    console.error('Get transcription result error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get transcription result',
    };
  }
}

/**
 * Poll transcription job until complete
 * @param {string} jobName - Job name
 * @param {number} maxAttempts - Maximum polling attempts
 * @param {number} delayMs - Delay between polls
 * @returns {Promise<Object>} Final result
 */
export async function pollTranscriptionJob(jobName, maxAttempts = 30, delayMs = 2000) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await getTranscriptionResult(jobName);

    if (result.status === 'COMPLETED' || result.status === 'FAILED') {
      return result;
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  return {
    success: false,
    error: 'Transcription timeout',
  };
}

/**
 * Get media format from S3 URI
 * @param {string} s3Uri - S3 URI
 * @returns {string} Media format
 */
function getMediaFormatFromUri(s3Uri) {
  const ext = s3Uri.split('.').pop().toLowerCase();
  
  const formatMap = {
    'mp3': 'mp3',
    'mp4': 'mp4',
    'wav': 'wav',
    'flac': 'flac',
    'ogg': 'ogg',
    'amr': 'amr',
    'webm': 'webm',
  };

  return formatMap[ext] || 'mp3';
}

/**
 * Calculate average confidence from transcript items
 * @param {Array} items - Transcript items
 * @returns {number} Average confidence (0-1)
 */
function calculateAverageConfidence(items) {
  if (!items || items.length === 0) return 0;

  const confidenceValues = items
    .filter(item => item.type === 'pronunciation' && item.alternatives?.[0]?.confidence)
    .map(item => parseFloat(item.alternatives[0].confidence));

  if (confidenceValues.length === 0) return 0;

  const sum = confidenceValues.reduce((acc, val) => acc + val, 0);
  return sum / confidenceValues.length;
}
