# AWS Keys & IDs Configuration Guide

## 📋 Complete List of Required Keys/IDs

Before we begin, here's what you should have from AWS Console:

### 1. AWS Account Credentials
- ✅ AWS Access Key ID: `AKIAXGR5Q7QN6N6LFHTF` (already have)
- ✅ AWS Secret Access Key: `fW4EugBT9dbHTHVVzHKgGdD5tBWowy8G12brY2hH` (already have)
- ✅ AWS Account ID: `495124020251` (already have)
- ✅ AWS Region: `us-east-1` (already configured)

### 2. Amazon Cognito
- ⚠️ **User Pool ID** (format: `us-east-1_XXXXXXXXX`)
- ⚠️ **App Client ID** (format: `1a2b3c4d5e6f7g8h9i0j1k2l3m`)
- ⚠️ **Identity Pool ID** (format: `us-east-1:12345678-1234-1234-1234-123456789012`)

### 3. Amazon S3
- ⚠️ **Audio Bucket Name** (e.g., `mindcare-audio-uploads`)
- ⚠️ **User Content Bucket Name** (e.g., `mindcare-user-content`)

### 4. Amazon Bedrock
- ✅ **Model ID**: `anthropic.claude-3-sonnet-20240229-v1:0` (standard, no key needed)

### 5. Amazon API Gateway
- ⚠️ **API Gateway URL** (format: `https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod`)

### 6. Aurora MySQL Database
- ⚠️ **Database Endpoint** (format: `mindcare-aurora-cluster.cluster-xxxxx.us-east-1.rds.amazonaws.com`)
- ⚠️ **Database Username** (e.g., `admin`)
- ⚠️ **Database Password** (your chosen password)
- ✅ **Database Name**: `mindcare` (already configured)
- ✅ **Database Port**: `3306` (standard)

### 7. AWS Lambda (Optional - for Lambda environment variables)
- ⚠️ **Lambda Function ARNs** (3 functions: auth-handler, chat-handler, voice-handler)

### 8. CloudFront (Optional)
- ⚠️ **CloudFront Distribution Domain** (format: `d1234567890.cloudfront.net`)

---

## 📁 File-by-File Configuration Guide

---

## FILE 1: `.env` (Frontend Environment Variables)

**Location:** Project root directory

**What to update:**

```env
# ============================================================================
# AWS CREDENTIALS (Already configured - DO NOT CHANGE)
# ============================================================================
VITE_AWS_ACCESS_KEY_ID=AKIAXGR5Q7QN6N6LFHTF
VITE_AWS_SECRET_ACCESS_KEY=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
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCOUNT_ID=495124020251

# ============================================================================
# AMAZON COGNITO (UPDATE THESE 3 VALUES)
# ============================================================================
# 1. Paste your Cognito User Pool ID here (from AWS Console → Cognito → User Pools)
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX

# 2. Paste your Cognito App Client ID here (from User Pool → App Integration → App clients)
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# 3. Paste your Cognito Identity Pool ID here (from AWS Console → Cognito → Identity Pools)
VITE_COGNITO_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# ============================================================================
# AMAZON API GATEWAY (UPDATE THIS 1 VALUE)
# ============================================================================
# 4. Paste your API Gateway URL here (from AWS Console → API Gateway → Stages → prod)
VITE_API_GATEWAY_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod

# ============================================================================
# AMAZON S3 BUCKETS (UPDATE THESE 2 VALUES)
# ============================================================================
# 5. Paste your S3 audio bucket name here (from AWS Console → S3)
VITE_S3_AUDIO_BUCKET=mindcare-audio-uploads

# 6. Paste your S3 user content bucket name here (from AWS Console → S3)
VITE_S3_USER_CONTENT_BUCKET=mindcare-user-content

# ============================================================================
# AMAZON BEDROCK (Already configured - DO NOT CHANGE)
# ============================================================================
VITE_BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0

# ============================================================================
# CLOUDFRONT (OPTIONAL - UPDATE IF YOU CREATED CLOUDFRONT)
# ============================================================================
# 7. Paste your CloudFront distribution domain here (OPTIONAL)
VITE_CLOUDFRONT_DOMAIN=d1234567890.cloudfront.net

# ============================================================================
# LOCAL DEVELOPMENT (Already configured - DO NOT CHANGE)
# ============================================================================
VITE_LOCAL_API_URL=http://localhost:8083
```

**Summary for `.env`:**
- ✅ Lines 1-4: Already configured (AWS credentials)
- ⚠️ Line 10: Paste Cognito User Pool ID
- ⚠️ Line 13: Paste Cognito App Client ID
- ⚠️ Line 16: Paste Cognito Identity Pool ID
- ⚠️ Line 22: Paste API Gateway URL
- ⚠️ Line 28: Paste S3 audio bucket name
- ⚠️ Line 31: Paste S3 user content bucket name
- ✅ Line 37: Already configured (Bedrock Model ID)
- ⚠️ Line 43: Paste CloudFront domain (optional)

---

## FILE 2: `server/.env` (Backend Environment Variables - IF USING LOCAL BACKEND)

**Location:** `server/.env`

**Note:** This file is only needed if you're running a local Express backend. If using Lambda only, skip this file.

**What to update:**

```env
# ============================================================================
# AWS CONFIGURATION (Already configured - DO NOT CHANGE)
# ============================================================================
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAXGR5Q7QN6N6LFHTF
AWS_SECRET_ACCESS_KEY=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
AWS_ACCOUNT_ID=495124020251

# ============================================================================
# AMAZON COGNITO (UPDATE THESE 2 VALUES)
# ============================================================================
# 1. Paste your Cognito User Pool ID here
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX

# 2. Paste your Cognito App Client ID here
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# ============================================================================
# AMAZON BEDROCK (Already configured - DO NOT CHANGE)
# ============================================================================
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0

# ============================================================================
# AMAZON TRANSCRIBE (Already configured - DO NOT CHANGE)
# ============================================================================
TRANSCRIBE_LANGUAGE_CODE=en-US

# ============================================================================
# AMAZON POLLY (Already configured - DO NOT CHANGE)
# ============================================================================
POLLY_VOICE_ID=Joanna
POLLY_ENGINE=neural

# ============================================================================
# AMAZON S3 (UPDATE THESE 2 VALUES)
# ============================================================================
# 3. Paste your S3 audio bucket name here
S3_AUDIO_BUCKET=mindcare-audio-uploads

# 4. Paste your S3 user content bucket name here
S3_USER_CONTENT_BUCKET=mindcare-user-content

# ============================================================================
# AURORA MYSQL DATABASE (UPDATE THESE 3 VALUES)
# ============================================================================
# 5. Paste your Aurora database endpoint here (from AWS Console → RDS → Databases)
DB_HOST=mindcare-aurora-cluster.cluster-xxxxx.us-east-1.rds.amazonaws.com

# 6. Paste your database username here (default: admin)
DB_USER=admin

# 7. Paste your database password here (the password you set during Aurora creation)
DB_PASSWORD=your_database_password_here

# Database name and port (Already configured - DO NOT CHANGE)
DB_NAME=mindcare
DB_PORT=3306

# ============================================================================
# SERVER CONFIGURATION (Already configured - DO NOT CHANGE)
# ============================================================================
PORT=8083
NODE_ENV=development

# ============================================================================
# API SECURITY (GENERATE RANDOM SECRETS)
# ============================================================================
# 8. Generate a random secret for API keys (use: openssl rand -base64 32)
API_KEY_SECRET=your_random_secret_here

# 9. Generate a random secret for JWT (use: openssl rand -base64 32)
JWT_SECRET=your_random_jwt_secret_here

# ============================================================================
# CORS (Already configured - DO NOT CHANGE)
# ============================================================================
CORS_ORIGIN=http://localhost:5173

# ============================================================================
# CLOUDWATCH LOGGING (Already configured - DO NOT CHANGE)
# ============================================================================
CLOUDWATCH_LOG_GROUP=/mindcare/application
CLOUDWATCH_LOG_STREAM=backend-api
```

**Summary for `server/.env`:**
- ✅ Lines 1-4: Already configured (AWS credentials)
- ⚠️ Line 10: Paste Cognito User Pool ID
- ⚠️ Line 13: Paste Cognito App Client ID
- ✅ Lines 18-30: Already configured (Bedrock, Transcribe, Polly)
- ⚠️ Line 36: Paste S3 audio bucket name
- ⚠️ Line 39: Paste S3 user content bucket name
- ⚠️ Line 45: Paste Aurora database endpoint
- ⚠️ Line 48: Paste database username
- ⚠️ Line 51: Paste database password
- ⚠️ Line 67: Generate random API key secret
- ⚠️ Line 70: Generate random JWT secret

---

## FILE 3: `src/lib/aws-config.ts` (AWS Amplify Configuration)

**Location:** `src/lib/aws-config.ts`

**What to update:**

Find these lines and update:

```typescript
// Line ~10-15: Update Cognito configuration
Auth: {
  Cognito: {
    userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || 'us-east-1_XXXXXXXXX', // ⚠️ Update fallback
    userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || 'xxxxxxxxxxxxxxxxxxxxxxxxxx', // ⚠️ Update fallback
    identityPoolId: import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID || 'us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // ⚠️ Update fallback
  }
},

// Line ~20-25: Update S3 configuration
Storage: {
  S3: {
    bucket: import.meta.env.VITE_S3_USER_CONTENT_BUCKET || 'mindcare-user-content', // ⚠️ Update fallback
    region: 'us-east-1', // ✅ Already configured
  }
}
```

**Note:** The fallback values (after `||`) are used if environment variables are not loaded. Update them to match your actual values.

---

## FILE 4: Lambda Function Environment Variables (AWS Console)

**Location:** AWS Console → Lambda → Each Function → Configuration → Environment variables

### Lambda Function 1: `mindcare-auth-handler`

Navigate to: AWS Console → Lambda → mindcare-auth-handler → Configuration → Environment variables → Edit

Add these variables:

| Key | Value | Where to get it |
|-----|-------|-----------------|
| `AWS_REGION` | `us-east-1` | ✅ Already known |
| `COGNITO_USER_POOL_ID` | `us-east-1_XXXXXXXXX` | ⚠️ AWS Console → Cognito → User Pools |
| `COGNITO_CLIENT_ID` | `xxxxxxxxxxxxxxxxxxxxxxxxxx` | ⚠️ User Pool → App Integration → App clients |

### Lambda Function 2: `mindcare-chat-handler`

Navigate to: AWS Console → Lambda → mindcare-chat-handler → Configuration → Environment variables → Edit

Add these variables:

| Key | Value | Where to get it |
|-----|-------|-----------------|
| `AWS_REGION` | `us-east-1` | ✅ Already known |
| `BEDROCK_MODEL_ID` | `anthropic.claude-3-sonnet-20240229-v1:0` | ✅ Already known |
| `DB_HOST` | `mindcare-aurora-cluster.cluster-xxxxx.us-east-1.rds.amazonaws.com` | ⚠️ AWS Console → RDS → Databases → Connectivity |
| `DB_PORT` | `3306` | ✅ Already known |
| `DB_USER` | `admin` | ⚠️ Your database username |
| `DB_PASSWORD` | `your_password_here` | ⚠️ Your database password |
| `DB_NAME` | `mindcare` | ✅ Already known |

### Lambda Function 3: `mindcare-voice-handler`

Navigate to: AWS Console → Lambda → mindcare-voice-handler → Configuration → Environment variables → Edit

Add these variables:

| Key | Value | Where to get it |
|-----|-------|-----------------|
| `AWS_REGION` | `us-east-1` | ✅ Already known |
| `S3_AUDIO_BUCKET` | `mindcare-audio-uploads` | ⚠️ AWS Console → S3 → Buckets |
| `TRANSCRIBE_LANGUAGE_CODE` | `en-US` | ✅ Already known |
| `POLLY_VOICE_ID` | `Joanna` | ✅ Already known |
| `POLLY_ENGINE` | `neural` | ✅ Already known |

---

## 📝 Quick Reference: Where to Find Each Key/ID

### 1. Cognito User Pool ID
**Path:** AWS Console → Cognito → User pools → mindcare-users → User pool overview
**Format:** `us-east-1_XXXXXXXXX`
**Copy from:** "User pool ID" field

### 2. Cognito App Client ID
**Path:** AWS Console → Cognito → User pools → mindcare-users → App integration tab → App clients and analytics
**Format:** `1a2b3c4d5e6f7g8h9i0j1k2l3m`
**Copy from:** Click on "mindcare-web-client" → "Client ID" field

### 3. Cognito Identity Pool ID
**Path:** AWS Console → Cognito → Identity pools → mindcare_identity_pool
**Format:** `us-east-1:12345678-1234-1234-1234-123456789012`
**Copy from:** "Identity pool ID" field

### 4. S3 Bucket Names
**Path:** AWS Console → S3 → Buckets
**Format:** `mindcare-audio-uploads`, `mindcare-user-content`
**Copy from:** Bucket name column

### 5. API Gateway URL
**Path:** AWS Console → API Gateway → APIs → MindCareAPI → Stages → prod
**Format:** `https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod`
**Copy from:** "Invoke URL" field at the top

### 6. Aurora Database Endpoint
**Path:** AWS Console → RDS → Databases → mindcare-aurora-cluster → Connectivity & security tab
**Format:** `mindcare-aurora-cluster.cluster-xxxxx.us-east-1.rds.amazonaws.com`
**Copy from:** "Endpoint" field under "Writer instance"

### 7. Lambda Function ARNs (Optional)
**Path:** AWS Console → Lambda → Functions → [function-name]
**Format:** `arn:aws:lambda:us-east-1:495124020251:function:mindcare-auth-handler`
**Copy from:** "Function ARN" at the top right

### 8. CloudFront Distribution Domain (Optional)
**Path:** AWS Console → CloudFront → Distributions
**Format:** `d1234567890.cloudfront.net`
**Copy from:** "Domain name" column

---

## ✅ Configuration Checklist

### Step 1: Gather All Keys/IDs
- [ ] Cognito User Pool ID
- [ ] Cognito App Client ID
- [ ] Cognito Identity Pool ID
- [ ] S3 Audio Bucket Name
- [ ] S3 User Content Bucket Name
- [ ] API Gateway URL
- [ ] Aurora Database Endpoint
- [ ] Database Username
- [ ] Database Password
- [ ] CloudFront Domain (optional)

### Step 2: Update Frontend Files
- [ ] Update `.env` file (7 values)
- [ ] Update `src/lib/aws-config.ts` fallback values (5 values)

### Step 3: Update Backend Files (if using local backend)
- [ ] Update `server/.env` file (9 values)
- [ ] Generate API_KEY_SECRET (use: `openssl rand -base64 32`)
- [ ] Generate JWT_SECRET (use: `openssl rand -base64 32`)

### Step 4: Update Lambda Environment Variables (AWS Console)
- [ ] Update `mindcare-auth-handler` Lambda (3 variables)
- [ ] Update `mindcare-chat-handler` Lambda (7 variables)
- [ ] Update `mindcare-voice-handler` Lambda (5 variables)

### Step 5: Verify Configuration
- [ ] Test frontend: `npm run dev`
- [ ] Test Cognito login
- [ ] Test S3 file upload
- [ ] Test AI chat (Bedrock)
- [ ] Test voice transcription
- [ ] Test database connection

---

## 🔒 Security Reminders

1. **NEVER commit `.env` files to Git** - They are already in `.gitignore`
2. **NEVER share your AWS Secret Access Key** publicly
3. **NEVER share your database password** publicly
4. **Use AWS Secrets Manager** for production (optional but recommended)
5. **Rotate credentials regularly** (every 90 days recommended)

---

## 🚀 Quick Start Commands

### Generate Random Secrets (for server/.env)
```bash
# Generate API_KEY_SECRET
openssl rand -base64 32

# Generate JWT_SECRET
openssl rand -base64 32
```

### Test Frontend Configuration
```bash
npm run dev
# Open http://localhost:5173
# Check browser console for any AWS configuration errors
```

### Test Backend Configuration (if using local backend)
```bash
cd server
node index.js
# Check terminal for any AWS connection errors
```

### Verify Environment Variables Loaded
```bash
# In your browser console (after running npm run dev)
console.log(import.meta.env.VITE_COGNITO_USER_POOL_ID)
console.log(import.meta.env.VITE_API_GATEWAY_URL)
```

---

## 📞 Troubleshooting

### Error: "User pool does not exist"
- ✅ Check `VITE_COGNITO_USER_POOL_ID` in `.env`
- ✅ Verify User Pool exists in AWS Console → Cognito
- ✅ Ensure region is `us-east-1`

### Error: "Access denied to Bedrock"
- ✅ Enable model access in AWS Console → Bedrock → Model access
- ✅ Request access to Claude 3 Sonnet model
- ✅ Wait 5 minutes for approval

### Error: "S3 bucket not found"
- ✅ Check bucket names in `.env`
- ✅ Verify buckets exist in AWS Console → S3
- ✅ Ensure buckets are in `us-east-1` region

### Error: "Cannot connect to database"
- ✅ Check `DB_HOST` in `server/.env` or Lambda environment variables
- ✅ Verify Aurora cluster is running in AWS Console → RDS
- ✅ Check security group allows connections from your IP

### Error: "API Gateway 403 Forbidden"
- ✅ Check `VITE_API_GATEWAY_URL` in `.env`
- ✅ Verify API is deployed to `prod` stage
- ✅ Check Cognito Authorizer is configured correctly

---

## 📋 Summary

**Total Configuration Points:**
- Frontend `.env`: 7 values to update
- Backend `server/.env`: 9 values to update (if using local backend)
- Lambda Functions: 15 environment variables across 3 functions
- `aws-config.ts`: 5 fallback values to update

**Already Configured (No Action Needed):**
- AWS Access Key ID
- AWS Secret Access Key
- AWS Account ID
- AWS Region (us-east-1)
- Bedrock Model ID
- Transcribe Language Code
- Polly Voice Settings
- Database Name and Port

**You Need to Provide:**
- 3 Cognito IDs (User Pool, Client, Identity Pool)
- 2 S3 Bucket Names
- 1 API Gateway URL
- 3 Database Credentials (Endpoint, Username, Password)
- 1 CloudFront Domain (optional)
- 2 Random Secrets (API Key, JWT) - if using local backend

---

**Once all keys are configured, your MindCare platform will be fully integrated with AWS services! 🚀**
