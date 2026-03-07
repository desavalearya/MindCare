// Amazon Bedrock Service
// Handles AI chat interactions with Claude

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { awsConfig } from '@/config/aws-config';

// Initialize Bedrock client
export const bedrockClient = new BedrockRuntimeClient({
  region: awsConfig.bedrock.region,
});

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface BedrockResponse {
  response: string;
  stopReason: string;
}

/**
 * Send message to Claude via Bedrock
 */
export const sendMessageToClaude = async (
  message: string,
  conversationHistory: ChatMessage[] = []
): Promise<BedrockResponse> => {
  const messages = [
    ...conversationHistory,
    {
      role: 'user' as const,
      content: message,
    },
  ];

  const systemPrompt = `You are a compassionate AI mental health companion for MindCare. 
Your role is to:
- Provide emotional support and active listening
- Suggest evidence-based coping strategies
- Encourage healthy habits and self-care
- Recognize when professional help may be needed
- Never diagnose or replace professional therapy
- Be warm, empathetic, and non-judgmental

Always prioritize user safety and well-being.`;

  const requestBody = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 1000,
    system: systemPrompt,
    messages: messages,
    temperature: 0.7,
  };

  const command = new InvokeModelCommand({
    modelId: awsConfig.bedrock.modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(requestBody),
  });

  const response = await bedrockClient.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));

  return {
    response: responseBody.content[0].text,
    stopReason: responseBody.stop_reason,
  };
};

export default bedrockClient;
