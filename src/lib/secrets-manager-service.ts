// AWS Secrets Manager Service for MindCare
import { 
  SecretsManagerClient, 
  GetSecretValueCommand,
  CreateSecretCommand,
  UpdateSecretCommand,
  DeleteSecretCommand
} from '@aws-sdk/client-secrets-manager';
import { AWS_REGION } from './aws-config';

const client = new SecretsManagerClient({ region: AWS_REGION });

export interface SecretValue {
  [key: string]: string;
}

/**
 * Retrieve a secret from AWS Secrets Manager
 */
export const getSecret = async (secretName: string): Promise<SecretValue> => {
  try {
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const response = await client.send(command);
    
    if (response.SecretString) {
      return JSON.parse(response.SecretString);
    }
    
    throw new Error('Secret not found or empty');
  } catch (error) {
    console.error('Error retrieving secret:', error);
    throw error;
  }
};

/**
 * Get database credentials from Secrets Manager
 */
export const getDatabaseCredentials = async () => {
  const secretName = import.meta.env.VITE_DB_SECRET_NAME || 'mindcare/database/credentials';
  return getSecret(secretName);
};

/**
 * Get API keys from Secrets Manager
 */
export const getApiKeys = async () => {
  const secretName = import.meta.env.VITE_API_SECRET_NAME || 'mindcare/api/keys';
  return getSecret(secretName);
};

/**
 * Create a new secret
 */
export const createSecret = async (secretName: string, secretValue: SecretValue): Promise<void> => {
  try {
    const command = new CreateSecretCommand({
      Name: secretName,
      SecretString: JSON.stringify(secretValue),
    });
    await client.send(command);
  } catch (error) {
    console.error('Error creating secret:', error);
    throw error;
  }
};

/**
 * Update an existing secret
 */
export const updateSecret = async (secretName: string, secretValue: SecretValue): Promise<void> => {
  try {
    const command = new UpdateSecretCommand({
      SecretId: secretName,
      SecretString: JSON.stringify(secretValue),
    });
    await client.send(command);
  } catch (error) {
    console.error('Error updating secret:', error);
    throw error;
  }
};

/**
 * Delete a secret
 */
export const deleteSecret = async (secretName: string, forceDelete = false): Promise<void> => {
  try {
    const command = new DeleteSecretCommand({
      SecretId: secretName,
      ForceDeleteWithoutRecovery: forceDelete,
    });
    await client.send(command);
  } catch (error) {
    console.error('Error deleting secret:', error);
    throw error;
  }
};
