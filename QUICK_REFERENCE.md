# MindCare AWS - Quick Reference Card

## 🚀 3-Step Quick Start

```bash
1. npm run setup:env      # Setup environment
2. npm run validate:env   # Validate configuration
3. npm run dev            # Start development
```

---

## 📋 Environment Variables Checklist

### Frontend (.env) - 9 Variables

- [ ] `VITE_AWS_REGION` → `us-east-1`
- [ ] `VITE_COGNITO_USER_POOL_ID` → `us-east-1_XXXXXXXXX`
- [ ] `VITE_COGNITO_CLIENT_ID` → `XXXXXXXXXXXXXXXXXXXXXXXXXX`
- [ ] `VITE_COGNITO_IDENTITY_POOL_ID` → `us-east-1:XXXX-XXXX-XXXX-XXXX`
- [ ] `VITE_S3_BUCKET_NAME` → `mindcare-storage-ACCOUNT_ID`
- [ ] `VITE_S3_AUDIO_BUCKET` → `mindcare-audio-ACCOUNT_ID`
- [ ] `VITE_BEDROCK_MODEL_ID` → `anthropic.claude-3-sonnet-20240229-v1:0`
- [ ] `VITE_API_GATEWAY_URL` → `https://XXXXX.execute-api.us-east-1.amazonaws.com/prod`
- [ ] `VITE_CLOUDFRONT_DOMAIN` → `XXXXX.cloudfront.net`

### Lambda: auth-handler - 3 Variables

- [ ] `AWS_REGION` → `us-east-1`
- [ ] `COGNITO_USER_POOL_ID` → `us-east-1_XXXXXXXXX`
- [ ] `COGNITO_CLIENT_ID` → `XXXXXXXXXXXXXXXXXXXXXXXXXX`

### Lambda: chat-handler - 7 Variables

- [ ] `AWS_REGION` → `us-east-1`
- [ ] `BEDROCK_MODEL_ID` → `anthropic.claude-3-sonnet-20240229-v1:0`
- [ ] `DB_HOST` → `mindcare-cluster.cluster-XXXXX.us-east-1.rds.amazonaws.com`
- [ ] `DB_PORT` → `3306`
- [ ] `DB_NAME` → `mindcare`
- [ ] `DB_USER` → `admin`
- [ ] `DB_PASSWORD` → `[from Secrets Manager]`

### Lambda: voice-handler - 5 Variables

- [ ] `AWS_REGION` → `us-east-1`
- [ ] `S3_AUDIO_BUCKET` → `mindcare-audio-ACCOUNT_ID`
- [ ] `TRANSCRIBE_LANGUAGE_CODE` → `en-US`
- [ ] `POLLY_VOICE_ID` → `Joanna`
- [ ] `POLLY_ENGINE` → `neural`

---

## 🔍 Where to Find AWS Resource IDs

| Resource | AWS Console Location | Format |
|----------|---------------------|--------|
| **User Pool ID** | Cognito → User Pools → [pool] → General settings | `us-east-1_XXXXXXXXX` |
| **App Client ID** | Cognito → User Pools → [pool] → App integration | `XXXXXXXXXXXXXXXXXXXXXXXXXX` |
| **Identity Pool ID** | Cognito → Identity Pools → [pool] → Edit | `us-east-1:XXXX-XXXX-XXXX-XXXX` |
| **S3 Bucket** | S3 → Buckets | `mindcare-storage-123456789012` |
| **API Gateway URL** | API Gateway → APIs → [api] → Stages → prod | `https://XXXXX.execute-api.us-east-1.amazonaws.com/prod` |
| **Aurora Endpoint** | RDS → Databases → [cluster] → Connectivity | `mindcare-cluster.cluster-XXXXX.us-east-1.rds.amazonaws.com` |
| **CloudFront Domain** | CloudFront → Distributions → [dist] | `XXXXX.cloudfront.net` |

---

## 💻 Useful Commands

### Setup & Validation
```bash
npm run setup:env          # Interactive setup
npm run validate:env       # Validate config
```

### Development
```bash
npm install                # Install dependencies
npm run dev                # Start dev server (port 8080)
npm run build              # Build for production
npm run preview            # Preview production build
```

### Lambda
```bash
npm run lambda:package     # Package functions
npm run lambda:deploy      # Deploy to AWS
```

### AWS CLI
```bash
# View Lambda logs
aws logs tail /aws/lambda/mindcare-auth-handler --follow

# List S3 buckets
aws s3 ls

# Get Cognito User Pools
aws cognito-idp list-user-pools --max-results 10 --region us-east-1

# Get API Gateway APIs
aws apigateway get-rest-apis --region us-east-1
```

---

## 📁 Key Files

### Configuration
- `.env` - Your AWS credentials (DO NOT COMMIT)
- `.env.example` - Template
- `src/config/aws-config.ts` - AWS config loader

### Services
- `src/services/aws/cognito.service.ts` - Cognito client
- `src/services/aws/s3.service.ts` - S3 client
- `src/services/aws/bedrock.service.ts` - Bedrock client
- `src/services/api.service.ts` - API Gateway client

### Lambda
- `lambda-functions/auth-handler.js` - Authentication
- `lambda-functions/chat-handler.js` - AI Chat
- `lambda-functions/voice-handler.js` - Voice processing

### Scripts
- `scripts/setup-env.sh` - Setup (Linux/Mac)
- `scripts/setup-env.bat` - Setup (Windows)
- `scripts/validate-env.js` - Validation

---

## 📚 Documentation Quick Links

| Document | Purpose |
|----------|---------|
| **FINAL_IMPLEMENTATION_SUMMARY.md** | Complete overview - START HERE |
| **IMPLEMENTATION_README.md** | Quick start guide |
| **AWS_ENVIRONMENT_SETUP_GUIDE.md** | Detailed setup instructions |
| **AWS_RESOURCES_REFERENCE.md** | Where to find resource IDs |
| **ARCHITECTURE_DIAGRAM.md** | System architecture |
| **SETUP_CHECKLIST.md** | Progress tracker |
| **QUICK_REFERENCE.md** | This file |

---

## 🔗 AWS Console Quick Links

Replace `ACCOUNT_ID` with your 12-digit AWS Account ID:

- **Cognito:** https://us-east-1.console.aws.amazon.com/cognito/v2/idp/user-pools
- **S3:** https://s3.console.aws.amazon.com/s3/buckets
- **Lambda:** https://us-east-1.console.aws.amazon.com/lambda/home#/functions
- **API Gateway:** https://us-east-1.console.aws.amazon.com/apigateway/main/apis
- **RDS:** https://us-east-1.console.aws.amazon.com/rds/home#databases:
- **Bedrock:** https://us-east-1.console.aws.amazon.com/bedrock/home#/model-access
- **CloudWatch:** https://us-east-1.console.aws.amazon.com/cloudwatch/home
- **Secrets Manager:** https://us-east-1.console.aws.amazon.com/secretsmanager/listsecrets

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "Missing AWS configuration" | Run `npm run validate:env` |
| Lambda 500 error | Check CloudWatch Logs |
| CORS error | Enable CORS in API Gateway, deploy to prod |
| Database connection error | Check security group, verify credentials |
| File upload fails | Check S3 CORS, verify IAM permissions |

---

## 🧪 Testing Checklist

- [ ] Environment validated (`npm run validate:env`)
- [ ] Dev server starts without errors
- [ ] Sign up works
- [ ] Email verification works
- [ ] Sign in works
- [ ] Chat with AI works
- [ ] Voice transcription works
- [ ] Speech synthesis works
- [ ] File upload works

---

## 🔐 Security Reminders

### ⚠️ NEVER COMMIT:
- `.env`
- `lambda-functions/.env`
- `*.zip`
- `aws-credentials.json`

### ✅ SAFE TO COMMIT:
- `.env.example`
- All source code
- All documentation

---

## 📊 AWS Services Used (14 Total)

1. ✅ Amazon Cognito - Authentication
2. ✅ Amazon S3 - File storage
3. ✅ AWS Lambda - Serverless functions (3 functions)
4. ✅ API Gateway - REST API
5. ✅ Amazon Aurora - Database (MySQL)
6. ✅ Amazon Bedrock - AI chat (Claude)
7. ✅ Amazon Transcribe - Speech-to-text
8. ✅ Amazon Polly - Text-to-speech
9. ✅ CloudFront - CDN
10. ✅ CloudWatch - Monitoring
11. ✅ AWS Amplify - Frontend hosting
12. ✅ Secrets Manager - Credentials
13. ✅ IAM - Access control
14. ✅ KMS - Encryption

---

## 🎯 Implementation Status

- ✅ Environment configuration system
- ✅ AWS service integration
- ✅ Setup and validation scripts
- ✅ Comprehensive documentation
- ✅ Lambda functions configured
- ✅ Security best practices
- ✅ Error handling
- ✅ TypeScript support

**Status:** COMPLETE  
**Version:** 1.0.0  
**Region:** us-east-1

---

## 🆘 Need Help?

1. Check CloudWatch Logs for errors
2. Review documentation files
3. Use SETUP_CHECKLIST.md to track progress
4. Contact AWS Support if needed

---

## 🎉 Quick Win

Get started in 3 commands:

```bash
npm run setup:env && npm run validate:env && npm run dev
```

Then open `http://localhost:8080` 🚀

---

**Print this page for quick reference while setting up!**
