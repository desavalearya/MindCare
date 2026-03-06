# TASK 3: Required Keys and IDs to Connect AWS Services

## 📋 Complete List of Keys, IDs, and Credentials

This document lists ALL keys, IDs, and credentials you need to collect during AWS setup to connect your application to AWS services.

---

## 🔑 1. AWS Account Credentials

### Already Configured (You Have These)

| Key Name | Value | Where to Use |
|----------|-------|--------------|
| **AWS Access Key ID** | `AKIAXGR5Q7QN6N6LFHTF` | `.env`, `server/.env`, Lambda env vars |
| **AWS Secret Access Key** | `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` | `.env`, `server/.env`, Lambda env vars |
| **AWS Account ID** | `495124020251` | `.env`, IAM policies, Lambda ARNs |
| **AWS Region** | `us-east-1` | All services |

### Where to Find (If Needed)
- Go to: https://console.aws.amazon.com/iam/home#/security_credentials
- Click "Access keys" section
- Your Access Key ID is listed there
- Secret Access Key is only shown once during creation

---

## 🔐 2. Amazon Cognito Keys

### User Pool Credentials

| Key Name | Format Example | Where to Find | Where to Use |
|----------|----------------|---------------|--------------|
| **User Pool ID** | `us-east-1_AbC123XyZ` | Cognito Console → User pools → mindcare-users → Pool ID | `.env` as `VITE_COGNITO_USER_POOL_ID`<br>`server/.env` as `COGNITO_USER_POOL_ID`<br>Lambda env vars |
| **App Client ID** | `1a2b3c4d5e6f7g8h9i0j1k2l3m` | Cognito Console → User pools → mindcare-users → App integration → App clients | `.env` as `VITE_COGNITO_CLIENT_ID`<br>`server/.env` as `COGNITO_CLIENT_ID`<br>Lambda env vars |
| **Identity Pool ID** | `us-east-1:12345678-1234-1234-1234-123456789012` | Cognito Console → Identity pools → mindcare_identity_pool → Identity pool ID | `.env` as `VITE_COGNITO_IDENTITY_POOL_ID` |

### How to Get These Keys

**User Pool ID:**
1. Go to: https://console.aws.amazon.com/cognito
2. Click "User pools"
3. Click "mindcare-users"
4. Copy "User pool ID" from the top

**App Client ID:**
1. In the same user pool page
2. Click "App integration" tab
3. Scroll to "App clients and analytics"
4. Click "mindcare-web-client"
5. Copy "Client ID"

**Identity Pool ID:**
1. Go to Cognito Console
2. Click "Identity pools" in left sidebar
3. Click "mindcare_identity_pool"
4. Copy "Identity pool ID"

---

## 🪣 3. Amazon S3 Keys

### S3 Bucket Names

| Key Name | Format Example | Where to Find | Where to Use |
|----------|----------------|---------------|--------------|
| **Audio Uploads Bucket** | `mindcare-audio-uploads` | S3 Console → Buckets list | `.env` as `VITE_S3_AUDIO_BUCKET`<br>`server/.env` as `S3_AUDIO_BUCKET`<br>Lambda env vars |
| **User Content Bucket** | `mindcare-user-content` | S3 Console → Buckets list | `.env` as `VITE_S3_BUCKET` and `VITE_S3_USER_CONTENT_BUCKET`<br>`server/.env` as `S3_USER_CONTENT_BUCKET` |

### How to Get These Keys

1. Go to: https://console.aws.amazon.com/s3
2. Your bucket names are listed in the "Buckets" page
3. Copy the exact bucket names you created

**Note:** If your bucket names are different (e.g., `mindcare-audio-uploads-495124020251`), use those exact names.

---

## 🤖 4. Amazon Bedrock Keys

### Bedrock Model Configuration

| Key Name | Value | Where to Use |
|----------|-------|--------------|
| **Model ID** | `anthropic.claude-3-sonnet-20240229-v1:0` | `server/.env` as `BEDROCK_MODEL_ID`<br>Lambda env vars<br>Hardcoded in `src/lib/bedrock-chat.ts` |
| **Region** | `us-east-1` | Same as AWS Region |

### How to Verify

1. Go to: https://console.aws.amazon.com/bedrock
2. Click "Model access" in left sidebar
3. Verify "Claude 3 Sonnet" shows "Access granted"
4. The model ID is always: `anthropic.claude-3-sonnet-20240229-v1:0`

---

## 🎙️ 5. Amazon Transcribe Keys

### Transcribe Configuration

| Key Name | Value | Where to Use |
|----------|-------|--------------|
| **Language Code** | `en-US` | `server/.env` as `TRANSCRIBE_LANGUAGE_CODE`<br>Lambda env vars |
| **Region** | `us-east-1` | Same as AWS Region |

**No additional keys needed** - uses AWS credentials

---

## 🔊 6. Amazon Polly Keys

### Polly Configuration

| Key Name | Value | Where to Use |
|----------|-------|--------------|
| **Voice ID** | `Joanna` | `server/.env` as `POLLY_VOICE_ID`<br>Lambda env vars |
| **Engine** | `neural` | `server/.env` as `POLLY_ENGINE`<br>Lambda env vars |
| **Language Code** | `en-US` | Hardcoded in code |
| **Region** | `us-east-1` | Same as AWS Region |

**No additional keys needed** - uses AWS credentials

---

## ⚡ 7. AWS Lambda Keys

### Lambda Function ARNs

| Key Name | Format Example | Where to Find | Where to Use |
|----------|----------------|---------------|--------------|
| **Auth Handler ARN** | `arn:aws:lambda:us-east-1:495124020251:function:mindcare-auth-handler` | Lambda Console → Functions → mindcare-auth-handler → Function ARN | API Gateway integration |
| **Chat Handler ARN** | `arn:aws:lambda:us-east-1:495124020251:function:mindcare-chat-handler` | Lambda Console → Functions → mindcare-chat-handler → Function ARN | API Gateway integration |
| **Voice Handler ARN** | `arn:aws:lambda:us-east-1:495124020251:function:mindcare-voice-handler` | Lambda Console → Functions → mindcare-voice-handler → Function ARN | API Gateway integration |

### How to Get These Keys

1. Go to: https://console.aws.amazon.com/lambda
2. Click on each function name
3. Copy "Function ARN" from the top-right

---

## 🌐 8. Amazon API Gateway Keys

### API Gateway Configuration

| Key Name | Format Example | Where to Find | Where to Use |
|----------|----------------|---------------|--------------|
| **API Gateway URL** | `https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod` | API Gateway Console → APIs → MindCareAPI → Stages → prod → Invoke URL | `.env` as `VITE_API_GATEWAY_URL` |
| **API ID** | `abc123xyz` | API Gateway Console → APIs → MindCareAPI → API ID | CloudFormation, documentation |
| **Stage Name** | `prod` | API Gateway Console → Stages | API URL path |

### How to Get These Keys

1. Go to: https://console.aws.amazon.com/apigateway
2. Click "APIs" in left sidebar
3. Click "MindCareAPI"
4. Click "Stages" in left sidebar
5. Click "prod"
6. Copy "Invoke URL" at the top

---

## 🗄️ 9. Aurora MySQL Keys

### Database Connection Details

| Key Name | Format Example | Where to Find | Where to Use |
|----------|----------------|---------------|--------------|
| **DB Host (Endpoint)** | `mindcare-aurora-cluster.cluster-abc123.us-east-1.rds.amazonaws.com` | RDS Console → Databases → mindcare-aurora-cluster → Connectivity & security → Endpoint | `server/.env` as `DB_HOST`<br>Lambda env vars |
| **DB Port** | `3306` | Always 3306 for MySQL | `server/.env` as `DB_PORT` |
| **DB Username** | `admin` | You set this during creation | `server/.env` as `DB_USER`<br>Lambda env vars |
| **DB Password** | `YourPassword123!` | You set this during creation | `server/.env` as `DB_PASSWORD`<br>Lambda env vars |
| **DB Name** | `mindcare` | You set this during creation | `server/.env` as `DB_NAME`<br>Lambda env vars |

### How to Get These Keys

1. Go to: https://console.aws.amazon.com/rds
2. Click "Databases" in left sidebar
3. Click "mindcare-aurora-cluster"
4. Click "Connectivity & security" tab
5. Copy "Writer endpoint"

**Password:** You must remember the password you set during database creation. If forgotten, you can reset it:
1. Click "Modify" on the database
2. Scroll to "Settings"
3. Enter new master password
4. Click "Continue" → "Modify DB cluster"

---

## 📊 10. CloudWatch Keys

### CloudWatch Configuration

| Key Name | Value | Where to Use |
|----------|-------|--------------|
| **Log Group Name** | `/mindcare/application` | `server/.env` as `CLOUDWATCH_LOG_GROUP`<br>Code for logging |
| **Log Stream Name** | `backend-api` | `server/.env` as `CLOUDWATCH_LOG_STREAM`<br>Code for logging |
| **Region** | `us-east-1` | Same as AWS Region |

**No additional keys needed** - uses AWS credentials

---

## 🌍 11. CloudFront Keys (Optional)

### CloudFront Distribution

| Key Name | Format Example | Where to Find | Where to Use |
|----------|----------------|---------------|--------------|
| **Distribution Domain** | `d1234567890.cloudfront.net` | CloudFront Console → Distributions → Your distribution → Domain name | `.env` as `VITE_CLOUDFRONT_DOMAIN`<br>Custom domain CNAME |
| **Distribution ID** | `E1234567890ABC` | CloudFront Console → Distributions → ID column | CloudFormation, CLI commands |

### How to Get These Keys

1. Go to: https://console.aws.amazon.com/cloudfront
2. Your distribution is listed
3. Copy "Domain name" (e.g., `d1234567890.cloudfront.net`)

---

## 🔐 12. AWS Secrets Manager Keys (Optional)

### Secrets Configuration

| Key Name | Value | Where to Use |
|----------|-------|--------------|
| **DB Secret Name** | `mindcare/database/credentials` | `.env` as `VITE_DB_SECRET_NAME`<br>`server/.env` as `DB_SECRET_NAME` |
| **API Secret Name** | `mindcare/api/keys` | `.env` as `VITE_API_SECRET_NAME` |

**To create secrets:**
1. Go to: https://console.aws.amazon.com/secretsmanager
2. Click "Store a new secret"
3. Select "Other type of secret"
4. Add key-value pairs (e.g., `username: admin`, `password: yourpass`)
5. Name it `mindcare/database/credentials`
6. Click "Store"

---

## 📝 Complete Environment Variables Template

### Frontend `.env` File

```env
# AWS Credentials
VITE_AWS_ACCESS_KEY_ID=AKIAXGR5Q7QN6N6LFHTF
VITE_AWS_SECRET_ACCESS_KEY=fW4EugBT9dbHTHVVzHKgGdD5tBWowy8G12brY2hH
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCOUNT_ID=495124020251

# Cognito (REPLACE WITH YOUR VALUES)
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_COGNITO_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# API Gateway (REPLACE WITH YOUR VALUE)
VITE_API_GATEWAY_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod

# S3 Buckets (REPLACE WITH YOUR VALUES)
VITE_S3_BUCKET=mindcare-user-content
VITE_S3_AUDIO_BUCKET=mindcare-audio-uploads
VITE_S3_USER_CONTENT_BUCKET=mindcare-user-content

# Secrets Manager
VITE_DB_SECRET_NAME=mindcare/database/credentials
VITE_API_SECRET_NAME=mindcare/api/keys

# CloudFront (Optional)
VITE_CLOUDFRONT_DOMAIN=d1234567890.cloudfront.net

# Local Development
VITE_LOCAL_API_URL=http://localhost:8083
```

### Backend `server/.env` File

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAXGR5Q7QN6N6LFHTF
AWS_SECRET_ACCESS_KEY=fW4EugBT9dbHTHVVzHKgGdD5tBWowy8G12brY2hH
AWS_ACCOUNT_ID=495124020251

# Cognito (REPLACE WITH YOUR VALUES)
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# Bedrock
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0

# Transcribe
TRANSCRIBE_LANGUAGE_CODE=en-US

# Polly
POLLY_VOICE_ID=Joanna
POLLY_ENGINE=neural

# S3 (REPLACE WITH YOUR VALUES)
S3_AUDIO_BUCKET=mindcare-audio-uploads
S3_USER_CONTENT_BUCKET=mindcare-user-content

# Secrets Manager
DB_SECRET_NAME=mindcare/database/credentials

# Database (REPLACE WITH YOUR VALUES)
DB_HOST=mindcare-aurora-cluster.cluster-xxxxx.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=your_password_here
DB_NAME=mindcare

# Server Configuration
PORT=8083
NODE_ENV=development

# API Security (GENERATE RANDOM VALUES)
API_KEY_SECRET=your_random_secret_here
JWT_SECRET=your_random_jwt_secret_here

# CORS
CORS_ORIGIN=http://localhost:5173

# CloudWatch
CLOUDWATCH_LOG_GROUP=/mindcare/application
CLOUDWATCH_LOG_STREAM=backend-api
```

---

## 🔍 Quick Reference: Where to Find Each Key

| Service | Console URL | Key Location |
|---------|-------------|--------------|
| **Cognito** | https://console.aws.amazon.com/cognito | User pools → mindcare-users |
| **S3** | https://console.aws.amazon.com/s3 | Buckets list |
| **Lambda** | https://console.aws.amazon.com/lambda | Functions → Function ARN |
| **API Gateway** | https://console.aws.amazon.com/apigateway | APIs → MindCareAPI → Stages → prod |
| **RDS** | https://console.aws.amazon.com/rds | Databases → mindcare-aurora-cluster |
| **CloudWatch** | https://console.aws.amazon.com/cloudwatch | Log groups |
| **CloudFront** | https://console.aws.amazon.com/cloudfront | Distributions |
| **Secrets Manager** | https://console.aws.amazon.com/secretsmanager | Secrets list |

---

## ✅ Verification Checklist

Before running your application, verify you have:

- [ ] AWS Access Key ID
- [ ] AWS Secret Access Key
- [ ] AWS Account ID
- [ ] AWS Region (us-east-1)
- [ ] Cognito User Pool ID
- [ ] Cognito App Client ID
- [ ] Cognito Identity Pool ID
- [ ] S3 Audio Bucket Name
- [ ] S3 User Content Bucket Name
- [ ] API Gateway URL
- [ ] Aurora DB Endpoint
- [ ] Aurora DB Username
- [ ] Aurora DB Password
- [ ] All values updated in `.env`
- [ ] All values updated in `server/.env`
- [ ] All values updated in Lambda environment variables

---

## 🚨 Security Reminders

1. **Never commit `.env` files to Git**
2. **Rotate your AWS credentials** after sharing them
3. **Use IAM roles** instead of access keys in production
4. **Enable MFA** on your AWS account
5. **Store database passwords** in AWS Secrets Manager for production
6. **Use environment-specific** credentials (dev vs prod)

---

**Total Keys Required**: 20+
**Estimated Collection Time**: 30 minutes
**Status**: Ready to collect during AWS setup
