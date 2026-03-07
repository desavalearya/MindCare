// Mock AWS Services for Local Development
// This allows testing the application without actual AWS credentials

export const MOCK_MODE = !import.meta.env.VITE_COGNITO_USER_POOL_ID;

// Mock Bedrock (Claude) responses
export const mockBedrockResponse = async (message: string): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const responses = [
    "I understand you're going through a difficult time. It's completely normal to feel this way. Would you like to talk more about what's on your mind?",
    "That sounds challenging. Remember, it's okay to take things one step at a time. What small step could you take today to feel a bit better?",
    "Thank you for sharing that with me. Your feelings are valid. Have you tried any coping strategies that have helped you in the past?",
    "I'm here to listen and support you. It takes courage to open up about these feelings. How long have you been feeling this way?",
    "That's a great insight. Self-awareness is an important step. What do you think might help you feel more balanced?",
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};

// Mock Transcribe
export const mockTranscribe = async (audioBlob: Blob): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return "This is a mock transcription of your audio. In production, this would be the actual transcribed text from Amazon Transcribe.";
};

// Mock Polly
export const mockPolly = async (text: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  // Return a data URL for a silent audio file
  return "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADhAC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAA4T8FkhsAAAAAAD/+xDEAAPAAAGkAAAAIAAANIAAAARMQU1FMy4xMDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+xDEHgPAAAGkAAAAIAAANIAAAARMQU1FMy4xMDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+xDEKAPAAAGkAAAAIAAANIAAAARMQU1FMy4xMDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+xDEOAPAAAGkAAAAIAAANIAAAARMQU1FMy4xMDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+xDEUAPAAAGkAAAAIAAANIAAAARMQU1FMy4xMDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+xDEaAPAAAGkAAAAIAAANIAAAARMQU1FMy4xMDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+xDEgAPAAAGkAAAAIAAANIAAAARMQU1FMy4xMDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+xDEmAPAAAGkAAAAIAAANIAAAARMQU1FMy4xMDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+xDEsAPAAAGkAAAAIAAANIAAAARMQU1FMy4xMDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+xDEyAPAAAGkAAAAIAAANIAAAARMQU1FMy4xMDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+xDE4APAAAGkAAAAIAAANIAAAARMQU1FMy4xMDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+xDE+APAAAGkAAAAIAAANIAAAARMQU1FMy4xMDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
};

// Mock S3 upload
export const mockS3Upload = async (file: File): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return `https://mock-s3-bucket.s3.us-east-1.amazonaws.com/uploads/${file.name}`;
};

// Mock user data
export const mockUserData = {
  username: "demo-user",
  email: "demo@mindcare.com",
  name: "Demo User",
  role: "user",
  emailVerified: true,
  createdAt: new Date().toISOString(),
  enabled: true,
};

// Mock chat history
export const mockChatHistory = [
  {
    id: 1,
    message: "Hello, I'm feeling a bit anxious today.",
    response: "I'm here to listen. It's completely normal to feel anxious sometimes. Would you like to talk about what's making you feel this way?",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    message: "I have a big presentation tomorrow and I'm worried about it.",
    response: "It's natural to feel nervous before a presentation. That shows you care about doing well. Have you prepared for it? Sometimes breaking down our worries can help us feel more in control.",
    created_at: new Date(Date.now() - 3000000).toISOString(),
  },
];

console.log(MOCK_MODE ? '🔧 Running in MOCK MODE - No AWS credentials required' : '✅ Running with AWS services');
