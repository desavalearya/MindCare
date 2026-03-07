// API Service
// Handles all API calls to Lambda functions via API Gateway

import { awsConfig } from '@/config/aws-config';

const API_BASE_URL = awsConfig.api.baseUrl;

/**
 * Get authentication token from storage
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

/**
 * Make authenticated API request
 */
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

// Authentication API
export const authApi = {
  validateToken: (token: string) =>
    apiRequest('/auth/validate', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  getUserInfo: () =>
    apiRequest('/auth/user', {
      method: 'GET',
    }),

  updateUser: (updates: any) =>
    apiRequest('/auth/user', {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  deleteUser: () =>
    apiRequest('/auth/user', {
      method: 'DELETE',
    }),

  listUsers: () =>
    apiRequest('/auth/users', {
      method: 'GET',
    }),
};

// Chat API
export const chatApi = {
  sendMessage: (userId: string, message: string, conversationHistory: any[] = []) =>
    apiRequest('/chat/send', {
      method: 'POST',
      body: JSON.stringify({ userId, message, conversationHistory }),
    }),

  getChatHistory: (userId: string, limit: number = 50) =>
    apiRequest(`/chat/history?userId=${userId}&limit=${limit}`, {
      method: 'GET',
    }),

  clearChatHistory: (userId: string) =>
    apiRequest('/chat/clear', {
      method: 'DELETE',
      body: JSON.stringify({ userId }),
    }),
};

// Voice API
export const voiceApi = {
  startTranscription: (audioFileUri: string, userId: string) =>
    apiRequest('/voice/transcribe', {
      method: 'POST',
      body: JSON.stringify({ audioFileUri, userId }),
    }),

  getTranscriptionStatus: (jobName: string) =>
    apiRequest(`/voice/transcribe/status?jobName=${jobName}`, {
      method: 'GET',
    }),

  synthesizeSpeech: (text: string, userId: string, voiceId: string = 'Joanna') =>
    apiRequest('/voice/synthesize', {
      method: 'POST',
      body: JSON.stringify({ text, userId, voiceId }),
    }),
};

export default {
  auth: authApi,
  chat: chatApi,
  voice: voiceApi,
};
