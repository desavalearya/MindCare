// Lambda Function: AI Chat Handler
// Handles AI chat interactions using Amazon Bedrock (Claude)

const { 
  BedrockRuntimeClient, 
  InvokeModelCommand 
} = require('@aws-sdk/client-bedrock-runtime');
const mysql = require('mysql2/promise');

const bedrockClient = new BedrockRuntimeClient({ 
  region: process.env.AWS_REGION 
});

const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0';

// Database connection pool
let dbPool;

/**
 * Get database connection pool
 */
function getDbPool() {
  if (!dbPool) {
    dbPool = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return dbPool;
}

/**
 * Lambda handler for chat operations
 */
exports.handler = async (event) => {
  console.log('Chat Handler Event:', JSON.stringify(event, null, 2));

  const { httpMethod, path, body } = event;
  const parsedBody = body ? JSON.parse(body) : {};

  try {
    if (path === '/chat/send' && httpMethod === 'POST') {
      return await sendMessage(parsedBody);
    }
    
    if (path === '/chat/history' && httpMethod === 'GET') {
      return await getChatHistory(event.queryStringParameters);
    }
    
    if (path === '/chat/clear' && httpMethod === 'DELETE') {
      return await clearChatHistory(parsedBody.userId);
    }

    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Route not found' }),
    };
  } catch (error) {
    console.error('Chat Handler Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};

/**
 * Send message to AI and get response
 */
async function sendMessage({ userId, message, conversationHistory = [] }) {
  // Build conversation context
  const messages = [
    ...conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content,
    })),
    {
      role: 'user',
      content: message,
    },
  ];

  // System prompt for mental health support
  const systemPrompt = `You are a compassionate AI mental health companion for MindCare. 
Your role is to:
- Provide emotional support and active listening
- Suggest evidence-based coping strategies
- Encourage healthy habits and self-care
- Recognize when professional help may be needed
- Never diagnose or replace professional therapy
- Be warm, empathetic, and non-judgmental

Always prioritize user safety and well-being.`;

  // Prepare request for Claude
  const requestBody = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 1000,
    system: systemPrompt,
    messages: messages,
    temperature: 0.7,
  };

  // Invoke Bedrock
  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(requestBody),
  });

  const response = await bedrockClient.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  
  const aiResponse = responseBody.content[0].text;

  // Save to database
  const db = getDbPool();
  await db.execute(
    'INSERT INTO chat_messages (user_id, message, response, created_at) VALUES (?, ?, ?, NOW())',
    [userId, message, aiResponse]
  );

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      response: aiResponse,
      timestamp: new Date().toISOString(),
    }),
  };
}

/**
 * Get chat history for a user
 */
async function getChatHistory({ userId, limit = 50 }) {
  const db = getDbPool();
  
  const [rows] = await db.execute(
    `SELECT id, message, response, created_at 
     FROM chat_messages 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT ?`,
    [userId, parseInt(limit)]
  );

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      history: rows.reverse(), // Return in chronological order
    }),
  };
}

/**
 * Clear chat history for a user
 */
async function clearChatHistory(userId) {
  const db = getDbPool();
  
  await db.execute(
    'DELETE FROM chat_messages WHERE user_id = ?',
    [userId]
  );

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Chat history cleared successfully',
    }),
  };
}
