# MindMate AWS Services - Quick Reference

## 🚀 Import Statements

### Authentication (Cognito)
```typescript
import { 
  cognitoSignUp, 
  cognitoSignIn, 
  cognitoSignOut,
  getCognitoCurrentUser,
  getCognitoUserAttributes,
  cognitoResetPassword 
} from '@/lib/cognito-auth';
```

### AI Chat (Bedrock)
```typescript
import { 
  sendChatMessage, 
  streamChatMessage, 
  analyzeEmotion 
} from '@/lib/bedrock-chat';
```

### Voice-to-Text (Transcribe)
```typescript
import { transcribeAudio } from '@/lib/transcribe-service';
```

### Text-to-Speech (Polly)
```typescript
import { 
  textToSpeech, 
  playAudio, 
  downloadAudio,
  getAvailableVoices 
} from '@/lib/polly-service';
```

### File Storage (S3)
```typescript
import { 
  uploadToS3, 
  uploadFileWithProgress,
  getDownloadUrl,
  uploadAudioFile,
  uploadProfilePicture 
} from '@/lib/s3-service';
```

## 📝 Usage Examples

### Sign Up User
```typescript
const result = await cognitoSignUp({
  email: 'user@example.com',
  password: 'SecurePass123!',
  name: 'John Doe',
  role: 'user' // or 'counsellor', 'admin'
});

if (result.success) {
  // Show verification code input
}
```

### Sign In User
```typescript
const result = await cognitoSignIn({
  email: 'user@example.com',
  password: 'SecurePass123!'
});

if (result.success) {
  console.log('User ID:', result.user.userId);
  console.log('Access Token:', result.tokens.accessToken);
}
```

### Send Chat Message
```typescript
const result = await sendChatMessage({
  message: 'I feel anxious today',
  conversationHistory: [
    { role: 'user', content: 'Hello' },
    { role: 'assistant', content: 'Hi! How can I help?' }
  ]
});

console.log('AI Response:', result.response);
```

### Transcribe Audio
```typescript
const audioFile = event.target.files[0]; // File from input

const result = await transcribeAudio({
  audioFile,
  userId: currentUser.id
});

console.log('Transcript:', result.transcript);
```

### Generate Speech
```typescript
const result = await textToSpeech({
  text: 'Hello, how are you feeling today?',
  voiceId: 'Joanna', // optional
  engine: 'neural' // optional
});

if (result.audioUrl) {
  playAudio(result.audioUrl);
}
```

### Upload File to S3
```typescript
const file = event.target.files[0];

const result = await uploadFileWithProgress(
  file,
  `uploads/${userId}/${file.name}`,
  (progress) => console.log(`Upload: ${progress}%`)
);

console.log('File URL:', result.url);
```

## 🔧 Backend API Examples

### Chat Endpoint
```javascript
app.post('/api/chat', async (req, res) => {
  const { message, conversationHistory, userId } = req.body;
  
  const result = await sendChatMessage(message, conversationHistory);
  
  if (result.success) {
    // Save to database
    await db.query(
      'INSERT INTO chat_messages (id, user_id, message_text, response_text) VALUES (?, ?, ?, ?)',
      [crypto.randomUUID(), userId, message, result.response]
    );
    
    res.json({ success: true, response: result.response });
  } else {
    res.status(500).json({ error: result.error });
  }
});
```

### Voice Transcription Endpoint
```javascript
app.post('/api/voice/transcribe', async (req, res) => {
  const { s3Uri, userId } = req.body;
  const jobName = `transcribe-${userId}-${Date.now()}`;
  
  await startTranscription(s3Uri, jobName);
  const result = await pollTranscriptionJob(jobName);
  
  res.json(result);
});
```

### Text-to-Speech Endpoint
```javascript
app.post('/api/tts', async (req, res) => {
  const { text, userId } = req.body;
  
  const result = await textToSpeech(text, userId);
  
  res.json({ audioUrl: result.audioUrl });
});
```

## 🗄️ Database Queries

### Save Mood Check-in
```sql
INSERT INTO mood_check_ins (id, user_id, mood, created_at)
VALUES (UUID(), ?, ?, NOW());
-- mood values: 'Happy', 'Dull', 'Sad', 'Anxious', 'Angry', 'Stressed', 'Depressed'
```

### Save Journal Entry
```sql
INSERT INTO journal_entries (id, user_id, entry_text, sentiment, ai_feedback, entry_date)
VALUES (?, ?, ?, ?, ?, CURDATE())
ON DUPLICATE KEY UPDATE entry_text = VALUES(entry_text);
```

### Log Wellness Activity
```sql
INSERT INTO wellness_activities (id, user_id, activity_type, duration_minutes, points_earned)
VALUES (?, ?, ?, ?, ?);
```

### Update User Points
```sql
INSERT INTO user_points (user_id, total_points, current_streak)
VALUES (?, ?, ?)
ON DUPLICATE KEY UPDATE 
  total_points = total_points + VALUES(total_points),
  current_streak = VALUES(current_streak);
```

### Get User Dashboard
```sql
SELECT * FROM user_dashboard_summary WHERE user_id = ?;
```

### Get Counsellor Dashboard
```sql
SELECT * FROM counsellor_dashboard_summary WHERE counsellor_id = ?;
```

## 🌍 Environment Variables

### Frontend (.env)
```bash
VITE_AWS_REGION=us-east-1
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_API_GATEWAY_URL=http://localhost:8083
VITE_S3_BUCKET=mindmate-user-content
VITE_S3_AUDIO_BUCKET=mindmate-audio-uploads
```

### Backend (server/.env)
```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
S3_AUDIO_BUCKET=mindmate-audio-uploads
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=mindmate
```

## 🎨 React Component Examples

### Sign In Form
```typescript
const handleSignIn = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const result = await cognitoSignIn({ email, password });
  
  if (result.success) {
    navigate('/dashboard');
  } else {
    setError('Invalid credentials');
  }
};
```

### Chat Component
```typescript
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [input, setInput] = useState('');

const handleSend = async () => {
  const result = await sendChatMessage({
    message: input,
    conversationHistory: messages
  });
  
  setMessages([
    ...messages,
    { role: 'user', content: input },
    { role: 'assistant', content: result.response }
  ]);
  setInput('');
};
```

### Voice Input Component
```typescript
const handleVoiceInput = async (audioFile: File) => {
  setLoading(true);
  
  const result = await transcribeAudio({ audioFile, userId });
  
  if (result.transcript) {
    setTranscript(result.transcript);
    // Send transcript to chat
    await handleSend(result.transcript);
  }
  
  setLoading(false);
};
```

## 🔍 Debugging Tips

### Check Cognito Token
```typescript
const token = await getCognitoToken();
console.log('JWT Token:', token);
```

### Check Current User
```typescript
const user = await getCognitoCurrentUser();
console.log('Current User:', user);
```

### Check User Attributes
```typescript
const attrs = await getCognitoUserAttributes();
console.log('User Role:', attrs?.role);
```

### Test Bedrock Connection
```typescript
const result = await sendChatMessage({ message: 'test' });
console.log('Bedrock Response:', result);
```

### Test S3 Upload
```typescript
const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
const result = await uploadToS3(testFile, 'test/test.txt');
console.log('S3 URI:', result);
```

## ⚠️ Common Errors

### "User pool does not exist"
- Check VITE_COGNITO_USER_POOL_ID in .env
- Verify User Pool exists in AWS Console

### "Access denied to Bedrock"
- Enable model access in AWS Bedrock Console
- Check IAM permissions for bedrock:InvokeModel

### "S3 bucket not found"
- Create bucket in AWS S3 Console
- Check bucket name matches .env

### "CORS error"
- Add CORS policy to S3 bucket
- Check API endpoint allows CORS

### "Invalid credentials"
- Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
- Check IAM user has required permissions

## 📚 Documentation Links

- [AWS Amplify](https://docs.amplify.aws/)
- [Amazon Cognito](https://docs.aws.amazon.com/cognito/)
- [Amazon Bedrock](https://docs.aws.amazon.com/bedrock/)
- [Amazon Transcribe](https://docs.aws.amazon.com/transcribe/)
- [Amazon Polly](https://docs.aws.amazon.com/polly/)
- [Amazon S3](https://docs.aws.amazon.com/s3/)

## 🎯 Testing Checklist

- [ ] Sign up creates user in Cognito
- [ ] Email verification works
- [ ] Sign in returns JWT token
- [ ] Chat uses Bedrock Claude
- [ ] Voice transcribes correctly
- [ ] TTS generates audio
- [ ] Files upload to S3
- [ ] Dashboard loads data
- [ ] Mood check-ins save
- [ ] Journal entries save

---

**Keep this file handy for quick reference during development!**
