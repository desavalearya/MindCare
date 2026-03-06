// Amazon Polly Service - Text to Speech
import { 
  PollyClient, 
  SynthesizeSpeechCommand,
  type SynthesizeSpeechCommandInput,
} from '@aws-sdk/client-polly';
import { AWS_REGION, POLLY_CONFIG } from './aws-config';

const pollyClient = new PollyClient({ region: AWS_REGION });

export interface TTSRequest {
  text: string;
  voiceId?: string;
  engine?: 'standard' | 'neural';
}

export interface TTSResponse {
  audioUrl: string;
  audioBlob?: Blob;
  error?: string;
}

// Convert text to speech
export const textToSpeech = async ({
  text,
  voiceId = POLLY_CONFIG.voiceId,
  engine = POLLY_CONFIG.engine as 'standard' | 'neural',
}: TTSRequest): Promise<TTSResponse> => {
  try {
    const command = new SynthesizeSpeechCommand({
      Text: text,
      OutputFormat: 'mp3',
      VoiceId: voiceId as any,
      Engine: engine,
      LanguageCode: POLLY_CONFIG.languageCode as any,
      TextType: 'text',
    });

    const response = await pollyClient.send(command);

    if (response.AudioStream) {
      // Convert stream to blob
      const audioBlob = await streamToBlob(response.AudioStream);
      const audioUrl = URL.createObjectURL(audioBlob);

      return {
        audioUrl,
        audioBlob,
      };
    }

    throw new Error('No audio stream received');
  } catch (error: any) {
    console.error('Polly TTS error:', error);
    return {
      audioUrl: '',
      error: error.message || 'Text-to-speech failed',
    };
  }
};

// Convert stream to blob
const streamToBlob = async (stream: any): Promise<Blob> => {
  const chunks: BlobPart[] = [];
  
  for await (const chunk of stream) {
    chunks.push(chunk as BlobPart);
  }
  
  return new Blob(chunks, { type: 'audio/mpeg' });
};

// Get available voices
export const getAvailableVoices = () => {
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
};

// Play audio directly
export const playAudio = (audioUrl: string): HTMLAudioElement => {
  const audio = new Audio(audioUrl);
  audio.play();
  return audio;
};

// Download audio file
export const downloadAudio = (audioUrl: string, filename: string = 'speech.mp3') => {
  const link = document.createElement('a');
  link.href = audioUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
