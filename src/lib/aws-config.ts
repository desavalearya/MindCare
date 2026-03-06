// AWS Configuration for MindCare
import { Amplify } from 'aws-amplify';

// Configure Amplify with Cognito
export const configureAmplify = () => {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
        userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '',
        identityPoolId: import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID || '',
        loginWith: {
          email: true,
        },
        signUpVerificationMethod: 'code',
        userAttributes: {
          email: {
            required: true,
          },
          name: {
            required: true,
          },
        },
        allowGuestAccess: false,
        passwordFormat: {
          minLength: 8,
          requireLowercase: true,
          requireUppercase: true,
          requireNumbers: true,
          requireSpecialCharacters: true,
        },
      },
    },
    API: {
      REST: {
        MindCareAPI: {
          endpoint: import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8083',
          region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
        },
      },
    },
    Storage: {
      S3: {
        bucket: import.meta.env.VITE_S3_BUCKET || '',
        region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
      },
    },
  });
};

// AWS Region Configuration
export const AWS_REGION = import.meta.env.VITE_AWS_REGION || 'us-east-1';

// S3 Bucket Names
export const S3_BUCKETS = {
  audioUploads: import.meta.env.VITE_S3_AUDIO_BUCKET || 'mindcare-audio-uploads',
  userContent: import.meta.env.VITE_S3_USER_CONTENT_BUCKET || 'mindcare-user-content',
};

// Bedrock Configuration
export const BEDROCK_CONFIG = {
  modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
  region: AWS_REGION,
};

// Transcribe Configuration
export const TRANSCRIBE_CONFIG = {
  languageCode: 'en-US',
  region: AWS_REGION,
};

// Polly Configuration
export const POLLY_CONFIG = {
  voiceId: 'Joanna',
  engine: 'neural',
  languageCode: 'en-US',
  region: AWS_REGION,
};
