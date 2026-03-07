// AWS Configuration
// This file centralizes all AWS service configurations using environment variables

export const awsConfig = {
  // AWS Region
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',

  // Amazon Cognito Configuration
  cognito: {
    userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
    clientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '',
    identityPoolId: import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID || '',
  },

  // Amazon S3 Configuration
  s3: {
    bucketName: import.meta.env.VITE_S3_BUCKET_NAME || '',
    audioBucket: import.meta.env.VITE_S3_AUDIO_BUCKET || '',
    region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  },

  // Amazon Bedrock Configuration
  bedrock: {
    modelId: import.meta.env.VITE_BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0',
    region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  },

  // API Gateway Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_GATEWAY_URL || '',
    endpoints: {
      auth: '/auth',
      chat: '/chat',
      voice: '/voice',
    },
  },

  // CloudFront Configuration
  cloudfront: {
    domain: import.meta.env.VITE_CLOUDFRONT_DOMAIN || '',
  },

  // Application Settings
  app: {
    name: import.meta.env.VITE_APP_NAME || 'MindCare',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  },
};

// Validation function to check if all required configs are present
export const validateAwsConfig = (): { valid: boolean; missing: string[] } => {
  const missing: string[] = [];

  if (!awsConfig.cognito.userPoolId) missing.push('VITE_COGNITO_USER_POOL_ID');
  if (!awsConfig.cognito.clientId) missing.push('VITE_COGNITO_CLIENT_ID');
  if (!awsConfig.cognito.identityPoolId) missing.push('VITE_COGNITO_IDENTITY_POOL_ID');
  if (!awsConfig.s3.bucketName) missing.push('VITE_S3_BUCKET_NAME');
  if (!awsConfig.s3.audioBucket) missing.push('VITE_S3_AUDIO_BUCKET');
  if (!awsConfig.api.baseUrl) missing.push('VITE_API_GATEWAY_URL');

  return {
    valid: missing.length === 0,
    missing,
  };
};

// Log configuration status (only in development)
if (import.meta.env.DEV) {
  const validation = validateAwsConfig();
  if (!validation.valid) {
    console.warn('⚠️ Missing AWS configuration:', validation.missing);
    console.warn('Please check your .env file and ensure all required variables are set.');
    console.warn('The application will run in development mode with limited functionality.');
  } else {
    console.log('✅ AWS configuration loaded successfully');
    console.log('📍 Region:', awsConfig.region);
    console.log('🔐 Cognito User Pool:', awsConfig.cognito.userPoolId);
    console.log('🪣 S3 Bucket:', awsConfig.s3.bucketName);
    console.log('🤖 Bedrock Model:', awsConfig.bedrock.modelId);
    console.log('🌐 API Gateway:', awsConfig.api.baseUrl);
  }
}

export default awsConfig;
