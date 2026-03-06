# MindMate AWS Lambda Migration - Implementation Guide

## 🎯 Overview

This guide covers the complete AWS Lambda migration for MindMate, transforming it from a monolithic Express application to a serverless architecture.

## ✅ Completed Implementation

### Frontend AWS Services (Installed & Configured)

1. **Amazon Cognito Authentication** ✅
   - File: `src/lib/cognito-auth.ts`
   - Features: Sign up, sign in, sign out, password reset, token management
   - Configuration: `src/lib/aws-config.ts`

2. **Amazon Bedrock (Claude AI)** ✅
   - File: `src/lib/bedrock-chat.ts`
   - Features: AI chat, emotion analysis, streaming responses
   - Model: Claude 3 Sonnet

3. **Amazon Transcribe (Voice-to-Text)** ✅
   - File: `src/lib/transcribe-service.ts`
   - Features: Audio transcription, job polling, format detection

4. **Amazon Polly (Text-to-Speech)** ✅
   - File: `src/lib/polly-service.ts`
   - Features: Neural TTS, multiple voices, audio playback

5. **Amazon S3 (Storage)** ✅
   - File: `src/lib/s3-service.ts`
   - Features: File upload, pre-signed URLs, audio/profile storage

### Backend AWS Services (Installed & Configured)

1. **Bedrock Service** ✅
   - File: `server/services/bedrock.js`
   - Features: Chat API, emotion analysis, wellness recommendations

2. **Transcribe Service** ✅
   - File: `server/services/transcribe.js`
   - Features: Job management, polling, confidence scoring

3. **Polly Service** ✅
   - File: `server/services/polly.js`
   - Features: TTS synthesis, S3 upload, voice selection

### Database Schema ✅
- File: `server/db/migrations.sql`
- Tables: mood_check_ins, journal_entries, wellness_activities, chat_messages, counsellor_sessions, rewards, user_rewards, user_points, counsellor_groups, group_members, daily_analytics
- Views: user_dashboard_summary, counsellor_dashboard_summary

### Configuration Files ✅
- `.env.example` - Frontend environment variables
- `server/.env.example` - Backend environment variables

## 📦 Dependencies Installed

### Frontend
```json
{
  "@aws-sdk/client-cognito-identity-provider": "^3.1002.0",
  "@aws-sdk/client-s3": "^3.1002.0",
  "@aws-sdk/s3-request-presigner": "^3.1002.0",
  "@aws-sdk/client-bedrock-runtime": "^3.1002.0",
  "@aws-sdk/client-transcribe": "^3.1002.0",
  "@aws-sdk/client-polly": "^3.1002.0",
  "aws-amplify": "^6.16.2",
  "@aws-amplify/ui-react": "^6.15.1"
}
```

### Backend
```json
{
  "@aws-sdk/client-cognito-identity-provider": "^3.1002.0",
  "@aws-sdk/client-s3": "^3.1002.0",
  "@aws-sdk/client-bedrock-runtime": "^3.1002.0",
  "@aws-sdk/client-transcribe": "^3.1002.0",
  "@aws-sdk/client-polly": "^3.1002.0",
  "@aws-sdk/client-secrets-manager": "^3.1002.0",
  "uuid": "^13.0.0"
}
```

## 🚀 Next Steps

### 1. AWS Account Setup (Required)

```bash
# Install AWS CLI
# Windows: Download from https://aws.amazon.com/cli/
# Mac: brew install awscli
# Linux: sudo apt install awscli

# Configure AWS credentials
aws configure
# Enter: Access Key ID, Secret Access Key, Region (us-east-1), Output format (json)
```

### 2. Create AWS Resources

#### A. Amazon Cognito User Pool
```bash
# Via AWS Console:
1. Go to Amazon Cognito
2. Create User Pool
3. Configure sign-in options: Email
4. Set password policy: Min 8 chars, uppercase, lowercase, numbers
5. Enable email verification
6. Create user groups: user, counsellor, admin
7. Copy User Pool ID and Client ID to .env
```

#### B. Amazon S3 Buckets
```bash
# Create buckets
aws s3 mb s3://mindmate-audio-uploads --region us-east-1
aws s3 mb s3://mindmate-user-content --region us-east-1

# Enable CORS
aws s3api put-bucket-cors --bucket mindmate-audio-uploads --cors-configuration file://cors-config.json
```

#### C. Enable Bedrock Model Access
```bash
# Via AWS Console:
1. Go to Amazon Bedrock
2. Navigate to Model Access
3. Request access to: Anthropic Claude 3 Sonnet
4. Wait for approval (usually instant)
```

### 3. Database Migration

```bash
# Run migrations
cd server
mysql -h your-db-host -u your-user -p your-database < db/migrations.sql

# Or for Aurora Serverless
aws rds-data execute-statement \
  --resource-arn "arn:aws:rds:us-east-1:xxx:cluster:mindmate-aurora" \
  --secret-arn "arn:aws:secretsmanager:us-east-1:xxx:secret:mindmate-db" \
  --database mindmate \
  --sql "$(cat db/migrations.sql)"
```

### 4. Environment Configuration

#### Frontend `.env`
```bash
cp .env.example .env
# Edit .env with your AWS values:
# - VITE_COGNITO_USER_POOL_ID
# - VITE_COGNITO_CLIENT_ID
# - VITE_S3_BUCKET
# - VITE_API_GATEWAY_URL (or use localhost for dev)
```

#### Backend `server/.env`
```bash
cd server
cp .env.example .env
# Edit server/.env with your AWS values:
# - AWS_ACCESS_KEY_ID
# - AWS_SECRET_ACCESS_KEY
# - COGNITO_USER_POOL_ID
# - S3_AUDIO_BUCKET
# - DB_HOST, DB_USER, DB_PASSWORD
```

### 5. Update Application Code

#### A. Initialize Amplify in Frontend
```typescript
// In src/main.tsx, add:
import { configureAmplify } from './lib/aws-config';

configureAmplify();
```

#### B. Update UserContext to use Cognito
```typescript
// Replace localStorage auth with Cognito
import { cognitoSignIn, cognitoSignOut, getCognitoCurrentUser } from '@/lib/cognito-auth';
```

#### C. Update SignIn/SignUp Pages
```typescript
// Use Cognito auth functions instead of API calls
import { cognitoSignIn, cognitoSignUp } from '@/lib/cognito-auth';
```

#### D. Update Backend API Routes
```javascript
// In server/index.js, add AWS service routes:
import { sendChatMessage } from './services/bedrock.js';
import { textToSpeech } from './services/polly.js';
import { startTranscription } from './services/transcribe.js';
```

### 6. Testing

```bash
# Test frontend
npm run dev

# Test backend
cd server
npm start

# Test AWS services
# 1. Sign up a new user (should create in Cognito)
# 2. Sign in (should get JWT token)
# 3. Send chat message (should use Bedrock)
# 4. Upload audio (should transcribe with Transcribe)
# 5. Generate speech (should use Polly)
```

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│              (Amplify + CloudFront)                      │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                 AWS Services                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Cognito  │  │ Bedrock  │  │Transcribe│             │
│  │  Auth    │  │  Claude  │  │  Voice   │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│  ┌──────────┐  ┌──────────┐                            │
│  │  Polly   │  │    S3    │                            │
│  │   TTS    │  │ Storage  │                            │
│  └──────────┘  └──────────┘                            │
└─────────────────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Express Backend (Temporary)                 │
│           (Will migrate to Lambda later)                 │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              MySQL Database                              │
│         (Will migrate to Aurora later)                   │
└─────────────────────────────────────────────────────────┘
```

## 📊 Cost Estimates

### Development/Testing (Low Usage)
- Cognito: $0 (first 50k MAU free)
- Bedrock: $10-30/month
- Transcribe: $5-15/month
- Polly: $2-5/month
- S3: $1-3/month
- **Total: ~$20-50/month**

### Production (1000 active users)
- Cognito: $0-5/month
- Bedrock: $100-300/month
- Transcribe: $50-100/month
- Polly: $20-40/month
- S3: $10-20/month
- Data Transfer: $10-20/month
- **Total: ~$190-485/month**

## 🔒 Security Checklist

- [ ] Enable MFA on AWS root account
- [ ] Create IAM users with least privilege
- [ ] Store credentials in AWS Secrets Manager
- [ ] Enable CloudTrail for audit logging
- [ ] Configure S3 bucket policies (no public access)
- [ ] Enable encryption at rest (S3, Aurora)
- [ ] Use HTTPS only (TLS 1.2+)
- [ ] Implement rate limiting on API
- [ ] Validate JWT tokens on every request
- [ ] Sanitize all user inputs

## 📚 Documentation

- [AWS Amplify Docs](https://docs.amplify.aws/)
- [Amazon Cognito Docs](https://docs.aws.amazon.com/cognito/)
- [Amazon Bedrock Docs](https://docs.aws.amazon.com/bedrock/)
- [Amazon Transcribe Docs](https://docs.aws.amazon.com/transcribe/)
- [Amazon Polly Docs](https://docs.aws.amazon.com/polly/)
- [Complete Migration Guide](.kiro/specs/mindmate-lambda-migration/COMPLETE_MIGRATION_GUIDE.md)

## 🐛 Troubleshooting

### Cognito Authentication Fails
- Check User Pool ID and Client ID in .env
- Verify email verification is enabled
- Check user exists in Cognito console

### Bedrock Returns 403
- Verify model access is enabled in Bedrock console
- Check IAM permissions for bedrock:InvokeModel
- Ensure correct model ID in configuration

### Transcribe Job Fails
- Verify audio file is in S3
- Check audio format is supported (mp3, wav, mp4)
- Ensure S3 bucket has correct permissions

### S3 Upload Fails
- Check bucket exists and is in correct region
- Verify CORS configuration
- Check IAM permissions for s3:PutObject

## 🎉 Success Criteria

- [ ] Users can sign up/sign in with Cognito
- [ ] AI chatbot responds using Bedrock Claude
- [ ] Voice messages are transcribed
- [ ] Text-to-speech works with Polly
- [ ] Files upload to S3 successfully
- [ ] Dashboard displays user data
- [ ] All tests pass
- [ ] No console errors
- [ ] AWS costs within budget

## 📞 Support

For issues or questions:
1. Check AWS service health dashboard
2. Review CloudWatch logs
3. Check this documentation
4. Contact AWS Support (if needed)

---

**Status**: Implementation Complete - Ready for AWS Setup
**Last Updated**: 2024
**Version**: 1.0
