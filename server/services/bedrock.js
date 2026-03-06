// Backend Bedrock Service
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const bedrockClient = new BedrockRuntimeClient({ 
  region: process.env.AWS_REGION || 'us-east-1' 
});

const DEFAULT_SYSTEM_PROMPT = `You are a compassionate AI mental health companion for MindMate. 
Your role is to:
- Provide emotional support and active listening
- Encourage healthy coping strategies
- Suggest mindfulness and wellness activities
- Recognize when professional help is needed
- Never diagnose or prescribe medication
- Always be empathetic, non-judgmental, and supportive

Remember: You are a supportive companion, not a replacement for professional therapy.`;

/**
 * Send chat message to Bedrock Claude
 * @param {string} message - User message
 * @param {Array} conversationHistory - Previous messages
 * @param {string} systemPrompt - System prompt override
 * @returns {Promise<Object>} Response with AI message
 */
export async function sendChatMessage(message, conversationHistory = [], systemPrompt = DEFAULT_SYSTEM_PROMPT) {
  try {
    const messages = [
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    const requestBody = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
      temperature: 0.7,
      top_p: 0.9,
    };

    const command = new InvokeModelCommand({
      modelId: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(requestBody),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    if (responseBody.content && responseBody.content.length > 0) {
      return {
        success: true,
        response: responseBody.content[0].text,
        usage: responseBody.usage,
      };
    }

    throw new Error('No response from Bedrock');
  } catch (error) {
    console.error('Bedrock chat error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get AI response',
    };
  }
}

/**
 * Analyze emotion from text
 * @param {string} text - Text to analyze
 * @returns {Promise<string>} Detected emotion
 */
export async function analyzeEmotion(text) {
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
      modelId: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0',
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
}

/**
 * Generate wellness recommendations
 * @param {Object} userProfile - User mood and activity data
 * @returns {Promise<Array>} Wellness recommendations
 */
export async function generateWellnessRecommendations(userProfile) {
  try {
    const systemPrompt = `You are a wellness advisor. Based on the user's recent mood and activities, suggest 3-5 specific wellness activities. Format as JSON array with: { "activity": "name", "description": "brief description", "duration": "time estimate" }`;

    const userContext = `Recent mood: ${userProfile.recentMood || 'neutral'}
Recent activities: ${userProfile.recentActivities?.join(', ') || 'none'}
Stress level: ${userProfile.stressLevel || 'moderate'}`;

    const requestBody = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContext }],
      temperature: 0.7,
    };

    const command = new InvokeModelCommand({
      modelId: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(requestBody),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    if (responseBody.content && responseBody.content.length > 0) {
      const text = responseBody.content[0].text;
      // Try to parse JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    return [];
  } catch (error) {
    console.error('Wellness recommendations error:', error);
    return [];
  }
}
