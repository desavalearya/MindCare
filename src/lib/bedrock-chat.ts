// Amazon Bedrock Chat Service
import { 
  BedrockRuntimeClient, 
  InvokeModelCommand,
  type InvokeModelCommandInput,
} from '@aws-sdk/client-bedrock-runtime';
import { AWS_REGION, BEDROCK_CONFIG } from './aws-config';

const bedrockClient = new BedrockRuntimeClient({ region: AWS_REGION });

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  systemPrompt?: string;
}

export interface ChatResponse {
  response: string;
  conversationId?: string;
  error?: string;
}

// Default system prompt for mental health support
const DEFAULT_SYSTEM_PROMPT = `You are a compassionate AI mental health companion for MindCare. 
Your role is to:
- Provide emotional support and active listening
- Encourage healthy coping strategies
- Suggest mindfulness and wellness activities
- Recognize when professional help is needed
- Never diagnose or prescribe medication
- Always be empathetic, non-judgmental, and supportive

Remember: You are a supportive companion, not a replacement for professional therapy.`;

// Send chat message to Bedrock Claude
export const sendChatMessage = async ({
  message,
  conversationHistory = [],
  systemPrompt = DEFAULT_SYSTEM_PROMPT,
}: ChatRequest): Promise<ChatResponse> => {
  try {
    // Build conversation context
    const messages = [
      ...conversationHistory,
      { role: 'user' as const, content: message },
    ];

    // Prepare request for Claude 3
    const requestBody = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: 0.7,
      top_p: 0.9,
    };

    const command = new InvokeModelCommand({
      modelId: BEDROCK_CONFIG.modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(requestBody),
    });

    const response = await bedrockClient.send(command);
    
    // Parse response
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    if (responseBody.content && responseBody.content.length > 0) {
      return {
        response: responseBody.content[0].text,
      };
    }

    throw new Error('No response from Bedrock');
  } catch (error: any) {
    console.error('Bedrock chat error:', error);
    return {
      response: '',
      error: error.message || 'Failed to get AI response',
    };
  }
};

// Stream chat response (for real-time responses)
export const streamChatMessage = async ({
  message,
  conversationHistory = [],
  systemPrompt = DEFAULT_SYSTEM_PROMPT,
  onChunk,
}: ChatRequest & { onChunk: (chunk: string) => void }): Promise<ChatResponse> => {
  try {
    const messages = [
      ...conversationHistory,
      { role: 'user' as const, content: message },
    ];

    const requestBody = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: 0.7,
      top_p: 0.9,
    };

    const command = new InvokeModelCommand({
      modelId: BEDROCK_CONFIG.modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(requestBody),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    if (responseBody.content && responseBody.content.length > 0) {
      const fullResponse = responseBody.content[0].text;
      
      // Simulate streaming by chunking the response
      const words = fullResponse.split(' ');
      for (let i = 0; i < words.length; i++) {
        onChunk(words[i] + ' ');
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      return { response: fullResponse };
    }

    throw new Error('No response from Bedrock');
  } catch (error: any) {
    console.error('Bedrock stream error:', error);
    return {
      response: '',
      error: error.message || 'Failed to stream AI response',
    };
  }
};

// Get emotion analysis from conversation
export const analyzeEmotion = async (text: string): Promise<string> => {
  try {
    const systemPrompt = `You are an emotion analyzer. Analyze the emotional tone of the user's message and respond with ONLY ONE of these emotions: happy, sad, anxious, angry, neutral, excited, stressed, calm. Respond with just the emotion word, nothing else.`;

    const requestBody = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 10,
      system: systemPrompt,
      messages: [{ role: 'user', content: text }],
      temperature: 0.3,
    };

    const command = new InvokeModelCommand({
      modelId: BEDROCK_CONFIG.modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(requestBody),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    if (responseBody.content && responseBody.content.length > 0) {
      return responseBody.content[0].text.trim().toLowerCase();
    }

    return 'neutral';
  } catch (error) {
    console.error('Emotion analysis error:', error);
    return 'neutral';
  }
};
