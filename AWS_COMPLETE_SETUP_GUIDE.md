# MindCare AWS Complete Setup Guide

## ✅ IMPLEMENTATION STATUS

All AWS services have been implemented! Here's what's ready:

### Frontend Services (src/lib/)
- ✅ `aws-config.ts` - Amplify configuration
- ✅ `cognito-auth.ts` - Authentication service
- ✅ `bedrock-chat.ts` - AI chat service
- ✅ `transcribe-service.ts` - Voice-to-text
- ✅ `polly-service.ts` - Text-to-speech
- ✅ `s3-service.ts` - File storage
- ✅ `secrets-manager-service.ts` - Secrets retrieval
- ✅ `cloudwatch-service.ts` - Logging and metrics

### Lambda Functions (lambda-functions/)
- ✅ `auth-handler.js` - Authentication operations
- ✅ `chat-handler.js` - AI chat with Bedrock
- ✅ `voice-handler.js` - Transcribe and Polly operations
- ✅ `package.json` - Lambda dependencies

### Infrastructure Configuration (aws-infrastructure/)
- ✅ `api-gateway-config.json` - REST API configuration
- ✅ `iam-policies.json` - IAM roles and policies
- ✅ `cloudfront-config.json` - CDN configuration

### Database
- ✅ `server/db/migrations.sql` - Complete schema

### Environment Configuration
- ✅ `.env` - Frontend environment (with your AWS credentials)
- ✅ `server/.env.example` - Backend environment template

## 🎯 WHAT YOU NEED TO DO NOW

Your AWS credentials are already configured in `.env`:
- Access Key ID: `AKIAXGR5Q7QN6N6LFHTF`
- Secret Access Key: `fW4EugBT9dbHTHVVzHKgGdD5tBWowy8G12brY2hH`
- Account ID: `495124020251`
- Region: `us-east-1`

### Step 1: Create AWS Resources (Required)

You need to create these resources in AWS Console:

#### 1.1 Amazon Cognito User Pool
```bash
# Go to AWS Console > Cognito > Create User Pool
# Configuration:
- Pool name: mindcare-users
- Sign-in options: Email
- Password policy: 8+ chars, uppercase, lowercase, numbers
- MFA: Optional (recommended for production)
- Email verification: Required
- Custom attributes: Add "role" (String)

# After creation, note down:
- User Pool ID (e.g., us-east-1_ABC123XYZ)
- App Client ID (e.g., 1a2b3c4d5e6f7g8h9i0j)
- Identity Pool ID (create in Cognito Identity)
```

#### 1.2 Amazon S3 Buckets
```bash
# Create two S3 buckets:
aws s3 mb s3://mindcare-audio-uploads --region us-east-1
aws s3 mb s3://mindcare-user-content --region us-east-1

# Configure CORS for both buckets:
aws s3api put-bucket-cors --bucket mindcare-audio-uploads --cors-configuration file://s3-cors.json
aws s3api put-bucket-cors --bucket mindcare-user-content --cors-configuration file://s3-cors.json
```

Create `s3-cors.json`:
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["http://localhost:5173", "https://mindcare.com"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3600
    }
  ]
}
```

#### 1.3 Amazon Bedrock Model Access
```bash
# Go to AWS Console > Bedrock > Model access
# Request access to: Claude 3 Sonnet
# This may take a few minutes to be approved
```

#### 1.4 Create Lambda Functions
```bash
# Install dependencies
cd lambda-functions
npm install

# Create Lambda functions using AWS CLI or Console
# Function 1: Auth Handler
aws lambda create-function \
  --function-name mindcare-auth-handler \
  --runtime nodejs20.x \
  --role arn:aws:iam::495124020251:role/LambdaExecutionRole \
  --handler auth-handler.handler \
  --zip-file fileb://auth-handler.zip \
  --timeout 30 \
  --memory-size 512

# Function 2: Chat Handler
aws lambda create-function \
  --function-name mindcare-chat-handler \
  --runtime nodejs20.x \
  --role arn:aws:iam::495124020251:role/LambdaExecutionRole \
  --handler chat-handler.handler \
  --zip-file fileb://chat-handler.zip \
  --timeout 60 \
  --memory-size 1024

# Function 3: Voice Handler
aws lambda create-function \
  --function-name mindcare-voice-handler \
  --runtime nodejs20.x \
  --role arn:aws:iam::495124020251:role/LambdaExecutionRole \
  --handler voice-handler.handler \
  --zip-file fileb://voice-handler.zip \
  --timeout 300 \
  --memory-size 1024
```

#### 1.5 Create API Gateway
```bash
# Import the API Gateway configuration
aws apigateway import-rest-api \
  --body file://aws-infrastructure/api-gateway-config.json \
  --region us-east-1

# Deploy the API
aws apigateway create-deployment \
  --rest-api-id <API_ID> \
  --stage-name prod
```

#### 1.6 Create IAM Roles
```bash
# Create Lambda execution role
aws iam create-role \
  --role-name LambdaExecutionRole \
  --assume-role-policy-document file://aws-infrastructure/iam-policies.json

# Attach policies
aws iam put-role-policy \
  --role-name LambdaExecutionRole \
  --policy-name LambdaExecutionPolicy \
  --policy-document file://aws-infrastructure/iam-policies.json
```

### Step 2: Update Environment Variables

After creating AWS resources, update these files:

#### `.env` (Frontend)
```bash
# Update these values with your actual resource IDs:
VITE_COGNITO_USER_POOL_ID=us-east-1_YOUR_POOL_ID
VITE_COGNITO_CLIENT_ID=YOUR_CLIENT_ID
VITE_COGNITO_IDENTITY_POOL_ID=us-east-1:YOUR_IDENTITY_POOL_ID
VITE_API_GATEWAY_URL=https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod
```

#### `server/.env` (Backend - if needed)
```bash
# Copy from server/.env.example and update:
AWS_ACCESS_KEY_ID=AKIAXGR5Q7QN6N6LFHTF
AWS_SECRET_ACCESS_KEY=fW4EugBT9dbHTHVVzHKgGdD5tBWowy8G12brY2hH
COGNITO_USER_POOL_ID=us-east-1_YOUR_POOL_ID
DB_HOST=your-database-host
DB_PASSWORD=your-database-password
```

### Step 3: Run Database Migrations

```bash
# Connect to your MySQL database and run:
mysql -h your-host -u your-user -p your-database < server/db/migrations.sql

# Or if using Aurora Serverless, use AWS Console Query Editor
```

### Step 4: Test the Application

```bash
# Install frontend dependencies
npm install

# Start development server
npm run dev

# The app should now be running at http://localhost:5173
```

## 🔐 SECURITY NOTES

### ⚠️ IMPORTANT: Your AWS credentials are now in `.env`

**For Development:**
- ✅ Credentials are in `.env` (already configured)
- ✅ `.env` is in `.gitignore` (never commit this file!)

**For Production:**
- ❌ DO NOT use root credentials or IAM user credentials in production
- ✅ Use IAM roles for Lambda functions
- ✅ Use Cognito Identity Pool for frontend authentication
- ✅ Store database credentials in AWS Secrets Manager
- ✅ Enable MFA on all IAM users
- ✅ Use least privilege IAM policies

### Rotate Your Credentials

Since you've shared your credentials, you should rotate them:

```bash
# 1. Create new access keys in IAM Console
# 2. Update .env with new keys
# 3. Delete old access keys
aws iam delete-access-key --access-key-id AKIAXGR5Q7QN6N6LFHTF --user-name dhruv
```

## 📊 COST ESTIMATES

### Development (Testing)
- Cognito: Free tier (50,000 MAUs)
- S3: ~$1-5/month
- Bedrock: ~$10-20/month (pay per use)
- Transcribe: ~$5-10/month
- Polly: ~$2-5/month
- Lambda: Free tier (1M requests/month)
- API Gateway: Free tier (1M requests/month)
- **Total: ~$20-50/month**

### Production (1,000 users)
- Cognito: Free tier
- S3: ~$10-20/month
- Bedrock: ~$50-100/month
- Transcribe: ~$20-40/month
- Polly: ~$10-20/month
- Lambda: ~$20-40/month
- API Gateway: ~$10-20/month
- Aurora Serverless: ~$50-100/month
- CloudFront: ~$20-40/month
- **Total: ~$190-380/month**

## 🚀 DEPLOYMENT OPTIONS

### Option 1: AWS Amplify (Recommended for Hackathon)
```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

### Option 2: Manual S3 + CloudFront
```bash
# Build frontend
npm run build

# Upload to S3
aws s3 sync dist/ s3://mindcare-frontend --delete

# Create CloudFront distribution using aws-infrastructure/cloudfront-config.json
```

### Option 3: Docker + ECS (More Complex)
```bash
# Build Docker image
docker build -t mindcare-frontend .

# Push to ECR
aws ecr create-repository --repository-name mindcare-frontend
docker tag mindcare-frontend:latest 495124020251.dkr.ecr.us-east-1.amazonaws.com/mindcare-frontend:latest
docker push 495124020251.dkr.ecr.us-east-1.amazonaws.com/mindcare-frontend:latest
```

## 📝 NEXT STEPS

1. ✅ **All code is implemented** - No more coding needed!
2. ⏳ **Create AWS resources** - Follow Step 1 above
3. ⏳ **Update environment variables** - Follow Step 2 above
4. ⏳ **Run database migrations** - Follow Step 3 above
5. ⏳ **Test the application** - Follow Step 4 above
6. ⏳ **Deploy to production** - Choose deployment option

## 🆘 TROUBLESHOOTING

### Issue: "Access Denied" errors
- Check IAM policies are correctly attached
- Verify AWS credentials are correct
- Ensure Bedrock model access is approved

### Issue: CORS errors
- Update S3 bucket CORS configuration
- Update API Gateway CORS settings
- Check CloudFront origin settings

### Issue: Lambda timeout
- Increase Lambda timeout (default: 30s, max: 900s)
- Increase Lambda memory (more memory = more CPU)
- Optimize database queries

### Issue: High costs
- Enable CloudWatch cost alerts
- Use S3 lifecycle policies to archive old data
- Implement caching with CloudFront
- Use Aurora Serverless v2 auto-scaling

## 📚 DOCUMENTATION

- [AWS Amplify Docs](https://docs.amplify.aws)
- [Cognito Developer Guide](https://docs.aws.amazon.com/cognito)
- [Bedrock User Guide](https://docs.aws.amazon.com/bedrock)
- [Lambda Developer Guide](https://docs.aws.amazon.com/lambda)
- [API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway)

## ✅ CHECKLIST

- [x] Install AWS SDK dependencies
- [x] Implement Cognito authentication
- [x] Implement Bedrock AI chat
- [x] Implement Transcribe voice-to-text
- [x] Implement Polly text-to-speech
- [x] Implement S3 file storage
- [x] Implement Secrets Manager
- [x] Implement CloudWatch logging
- [x] Create Lambda functions
- [x] Create API Gateway configuration
- [x] Create IAM policies
- [x] Create CloudFront configuration
- [x] Create database schema
- [x] Configure environment variables
- [ ] Create Cognito User Pool
- [ ] Create S3 buckets
- [ ] Enable Bedrock model access
- [ ] Deploy Lambda functions
- [ ] Create API Gateway
- [ ] Create IAM roles
- [ ] Run database migrations
- [ ] Test authentication flow
- [ ] Test AI chat
- [ ] Test voice features
- [ ] Deploy to production

---

**Status**: All code implementation complete! ✅
**Next**: Create AWS resources and deploy
**Estimated Time**: 2-4 hours for AWS setup
