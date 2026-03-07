// Amazon Cognito Service
// Handles authentication and user management

import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { awsConfig } from '@/config/aws-config';

// Initialize Cognito client
export const cognitoClient = new CognitoIdentityProviderClient({
  region: awsConfig.region,
});

// Cognito configuration for Amplify
export const cognitoAuthConfig = {
  Cognito: {
    userPoolId: awsConfig.cognito.userPoolId,
    userPoolClientId: awsConfig.cognito.clientId,
    identityPoolId: awsConfig.cognito.identityPoolId,
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
    passwordFormat: {
      minLength: 8,
      requireLowercase: true,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialCharacters: true,
    },
  },
};

export default cognitoClient;
