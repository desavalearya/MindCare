# MindMate AWS Integration Guide

## Quick Start: Integrating AWS Services into Existing Code

This guide shows exactly which files to update to integrate the new AWS services.

## 1. Initialize Amplify (Required First)

### File: `src/main.tsx`

Add this at the top, before ReactDOM.render:

```typescript
import { configureAmplify } from './lib/aws-config';

// Initialize AWS Amplify
configureAmplify();

// ... rest of your code
```

## 2. Update Authentication

### File: `src/contexts/UserContext.tsx`

Replace localStorage authentication with Cognito:

```typescript
import { 
  cognitoSignIn, 
  cognitoSignUp, 
  cognitoSignOut, 
  getCognitoCurrentUser,
  getCognitoUserAttributes 
} from '@/lib/cognito-auth';

// Replace signIn function:
const signIn = async (email: string, password: string) => {
  try {
    const result = await cognitoSignIn({ email, password });
    
    if (result.success && result.user) {
      const attributes = await getCognitoUserAttributes();
      
      setUser({
        id: result.user.userId,
        email: attributes?.email || email,
        name: attributes?.name || '',
        role: attributes?.role || 'user',
      });
      
      return { success: true };
    }
    
    return { success: false, error: 'Sign in failed' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Replace signUp function:
const signUp = async (email: string, password: string, name: string, role: string) => {
  try {
    const result = await cognitoSignUp({ email, password, name, role });
    return { success: result.success };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Replace signOut function:
const signOut = async () => {
  await cognitoSignOut();
  setUser(null);
};

// On app load, check for existing session:
useEffect(() => {
  const checkAuth = async () => {
    const currentUser = await getCognitoCurrentUser();
    if (currentUser) {
      const attributes = await getCognitoUserAttributes();
      setUser({
        id: currentUser.userId,
        email: attributes?.email || '',
        name: attributes?.name || '',
        role: attributes?.role || 'user',
      });
    }
  };
  checkAuth();
}, []);
```

### File: `src/pages/auth/SignIn.tsx`

Update to use Cognito directly:

```typescript
import { cognitoSignIn } from '@/lib/cognito-auth';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const result = await cognitoSignIn({ 
      email: formData.email, 
      password: formData.password 
    });

    if (result.success) {
      // Redirect to dashboard
      navigate('/dashboard');
    } else {
      setError('Invalid credentials');
    }
  } catch (error: any) {
    setError(error.message || 'Sign in failed');
  } finally {
    setLoading(false);
  }
};
```

### File: `src/pages/auth/SignUp.tsx`

Update to use Cognito:

```typescript
import { cognitoSignUp, cognitoConfirmSignUp } from '@/lib/cognito-auth';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const result = await cognitoSignUp({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      role: formData.role || 'user',
    });

    if (result.success) {
      // Show verification code input
      setShowVerification(true);
    }
  } catch (error: any) {
    setError(error.message || 'Sign up failed');
  } finally {
    setLoading(false);
  }
};

// Add verification handler
const handleVerification = async (code: string) => {
  try {
    await cognitoConfirmSignUp(formData.email, code);
    navigate('/signin');
  } catch (error: any) {
    setError(error.message || 'Verification failed');
  }
};
```

## 3. Update AI Chatbot

### File: `src/components/dashboard/AIChatbot.tsx`

Replace Gemini with Bedrock:

```typescript
import { sendChatMessage } from '@/lib/bedrock-chat';

const handleSendMessage = async () => {
  if (!input.trim()) return;

  const userMessage = { role: 'user' as const, content: input };
  setMessages(prev => [...prev, userMessage]);
  setInput('');
  setLoading(true);

  try {
    const result = await sendChatMessage({
      message: input,
      conversationHistory: messages,
    });

    if (result.response) {
      setMessages(prev => [...prev, {
        role: 'assistant' as const,
        content: result.response,
      }]);
    } else if (result.error) {
      console.error('Chat error:', result.error);
    }
  } catch (error) {
    console.error('Failed to send message:', error);
  } finally {
    setLoading(false);
  }
};
```

## 4. Add Voice Features

### Create: `src/components/dashboard/VoiceChat.tsx`

```typescript
import { useState } from 'react';
import { transcribeAudio } from '@/lib/transcribe-service';
import { textToSpeech, playAudio } from '@/lib/polly-service';
import { Button } from '@/components/ui/button';
import { Mic, Volume2 } from 'lucide-react';

export function VoiceChat({ userId }: { userId: string }) {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVoiceInput = async (audioFile: File) => {
    setLoading(true);
    try {
      const result = await transcribeAudio({ audioFile, userId });
      if (result.transcript) {
        setTranscript(result.transcript);
      }
    } catch (error) {
      console.error('Transcription failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTextToSpeech = async (text: string) => {
    setLoading(true);
    try {
      const result = await textToSpeech({ text });
      if (result.audioUrl) {
        playAudio(result.audioUrl);
      }
    } catch (error) {
      console.error('TTS failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={() => setRecording(!recording)}>
        <Mic className={recording ? 'animate-pulse' : ''} />
        {recording ? 'Stop Recording' : 'Start Recording'}
      </Button>
      
      {transcript && (
        <div className="p-4 bg-gray-100 rounded">
          <p>{transcript}</p>
          <Button onClick={() => handleTextToSpeech(transcript)}>
            <Volume2 /> Play Response
          </Button>
        </div>
      )}
    </div>
  );
}
```

## 5. Update Backend API

### File: `server/index.js`

Add AWS service routes:

```javascript
import { sendChatMessage, analyzeEmotion } from './services/bedrock.js';
import { textToSpeech } from './services/polly.js';
import { startTranscription, pollTranscriptionJob } from './services/transcribe.js';

// Chat endpoint with Bedrock
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory, userId } = req.body;
    
    const result = await sendChatMessage(message, conversationHistory);
    
    if (result.success) {
      // Save to database
      const messageId = crypto.randomUUID();
      await db.query(
        'INSERT INTO chat_messages (id, user_id, message_text, response_text, model_used) VALUES (?, ?, ?, ?, ?)',
        [messageId, userId, message, result.response, 'bedrock-claude']
      );
      
      res.json({ success: true, response: result.response });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Voice transcription endpoint
app.post('/api/voice/transcribe', async (req, res) => {
  try {
    const { s3Uri, userId } = req.body;
    const jobName = `transcribe-${userId}-${Date.now()}`;
    
    const startResult = await startTranscription(s3Uri, jobName);
    
    if (startResult.success) {
      // Poll for completion
      const result = await pollTranscriptionJob(jobName);
      res.json(result);
    } else {
      res.status(500).json(startResult);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Text-to-speech endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const { text, userId, voiceId } = req.body;
    
    const result = await textToSpeech(text, userId, { voiceId });
    
    if (result.success) {
      res.json({ success: true, audioUrl: result.audioUrl });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

## 6. Environment Setup

### Step 1: Copy environment files
```bash
# Frontend
cp .env.example .env

# Backend
cp server/.env.example server/.env
```

### Step 2: Fill in AWS credentials
Get these from AWS Console:
- Cognito User Pool ID
- Cognito Client ID
- S3 Bucket names
- AWS Access Keys

### Step 3: Run database migrations
```bash
mysql -h your-host -u your-user -p your-database < server/db/migrations.sql
```

## 7. Testing Checklist

- [ ] User can sign up with Cognito
- [ ] User receives verification email
- [ ] User can sign in and get JWT token
- [ ] AI chatbot responds using Bedrock
- [ ] Voice recording transcribes correctly
- [ ] Text-to-speech generates audio
- [ ] Files upload to S3
- [ ] Dashboard loads user data
- [ ] Mood check-ins save to database
- [ ] Journal entries save correctly

## 8. Common Issues

### Issue: "User pool does not exist"
**Solution**: Check VITE_COGNITO_USER_POOL_ID in .env

### Issue: "Access denied to Bedrock"
**Solution**: Enable model access in AWS Bedrock console

### Issue: "S3 bucket not found"
**Solution**: Create buckets with correct names in AWS S3 console

### Issue: "CORS error on S3 upload"
**Solution**: Add CORS policy to S3 bucket

## 9. Development vs Production

### Development (Local)
- Use local MySQL database
- Use AWS services with dev credentials
- Set VITE_API_GATEWAY_URL to http://localhost:8083

### Production (AWS)
- Use Aurora Serverless
- Use production AWS credentials
- Set VITE_API_GATEWAY_URL to API Gateway URL
- Deploy frontend to Amplify
- Deploy backend to Lambda (future)

## Next Steps

1. Complete AWS account setup
2. Create Cognito User Pool
3. Create S3 buckets
4. Enable Bedrock model access
5. Update .env files
6. Run database migrations
7. Test each feature
8. Deploy to production

---

**Need Help?** Check AWS_MIGRATION_README.md for detailed setup instructions.
