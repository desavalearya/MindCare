# AWS Keys Quick Checklist

## 📝 Keys/IDs You Need to Collect

### ✅ Already Have (No Action Needed)
- [x] AWS Access Key ID: `AKIAXGR5Q7QN6N6LFHTF`
- [x] AWS Secret Access Key: `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`
- [x] AWS Account ID: `495124020251`
- [x] AWS Region: `us-east-1`
- [x] Bedrock Model ID: `anthropic.claude-3-sonnet-20240229-v1:0`

### ⚠️ Need to Collect from AWS Console

#### 1. Amazon Cognito (3 values)
- [ ] **User Pool ID** 
  - Location: AWS Console → Cognito → User pools → mindcare-users
  - Format: `us-east-1_XXXXXXXXX`
  - Your value: `_______________________________`

- [ ] **App Client ID**
  - Location: User Pool → App integration → App clients → mindcare-web-client
  - Format: `1a2b3c4d5e6f7g8h9i0j1k2l3m`
  - Your value: `_______________________________`

- [ ] **Identity Pool ID**
  - Location: AWS Console → Cognito → Identity pools → mindcare_identity_pool
  - Format: `us-east-1:12345678-1234-1234-1234-123456789012`
  - Your value: `_______________________________`

#### 2. Amazon S3 (2 values)
- [ ] **Audio Bucket Name**
  - Location: AWS Console → S3 → Buckets
  - Format: `mindcare-audio-uploads`
  - Your value: `_______________________________`

- [ ] **User Content Bucket Name**
  - Location: AWS Console → S3 → Buckets
  - Format: `mindcare-user-content`
  - Your value: `_______________________________`

#### 3. Amazon API Gateway (1 value)
- [ ] **API Gateway URL**
  - Location: AWS Console → API Gateway → MindCareAPI → Stages → prod
  - Format: `https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod`
  - Your value: `_______________________________`

#### 4. Aurora MySQL Database (3 values)
- [ ] **Database Endpoint**
  - Location: AWS Console → RDS → Databases → mindcare-aurora-cluster → Connectivity
  - Format: `mindcare-aurora-cluster.cluster-xxxxx.us-east-1.rds.amazonaws.com`
  - Your value: `_______________________________`

- [ ] **Database Username**
  - Default: `admin`
  - Your value: `_______________________________`

- [ ] **Database Password**
  - The password you set during Aurora creation
  - Your value: `_______________________________`

#### 5. CloudFront (Optional - 1 value)
- [ ] **CloudFront Distribution Domain**
  - Location: AWS Console → CloudFront → Distributions
  - Format: `d1234567890.cloudfront.net`
  - Your value: `_______________________________`

---

## 📁 Files to Update

### File 1: `.env` (Frontend - Project Root)
```env
# Update these 7 lines:
VITE_COGNITO_USER_POOL_ID=_______________  # Line 10
VITE_COGNITO_CLIENT_ID=_______________     # Line 13
VITE_COGNITO_IDENTITY_POOL_ID=_______________  # Line 16
VITE_API_GATEWAY_URL=_______________       # Line 22
VITE_S3_AUDIO_BUCKET=_______________       # Line 28
VITE_S3_USER_CONTENT_BUCKET=_______________  # Line 31
VITE_CLOUDFRONT_DOMAIN=_______________     # Line 43 (optional)
```

### File 2: `server/.env` (Backend - Only if using local backend)
```env
# Update these 9 lines:
COGNITO_USER_POOL_ID=_______________       # Line 10
COGNITO_CLIENT_ID=_______________          # Line 13
S3_AUDIO_BUCKET=_______________            # Line 36
S3_USER_CONTENT_BUCKET=_______________     # Line 39
DB_HOST=_______________                    # Line 45
DB_USER=_______________                    # Line 48
DB_PASSWORD=_______________                # Line 51
API_KEY_SECRET=_______________             # Line 67 (generate random)
JWT_SECRET=_______________                 # Line 70 (generate random)
```

### File 3: `src/lib/aws-config.ts` (Frontend Config)
```typescript
// Update fallback values (lines 10-25):
userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '_______________',
userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '_______________',
identityPoolId: import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID || '_______________',
bucket: import.meta.env.VITE_S3_USER_CONTENT_BUCKET || '_______________',
```

### File 4: Lambda Environment Variables (AWS Console)

#### Lambda 1: `mindcare-auth-handler`
```
AWS_REGION = us-east-1
COGNITO_USER_POOL_ID = _______________
COGNITO_CLIENT_ID = _______________
```

#### Lambda 2: `mindcare-chat-handler`
```
AWS_REGION = us-east-1
BEDROCK_MODEL_ID = anthropic.claude-3-sonnet-20240229-v1:0
DB_HOST = _______________
DB_PORT = 3306
DB_USER = _______________
DB_PASSWORD = _______________
DB_NAME = mindcare
```

#### Lambda 3: `mindcare-voice-handler`
```
AWS_REGION = us-east-1
S3_AUDIO_BUCKET = _______________
TRANSCRIBE_LANGUAGE_CODE = en-US
POLLY_VOICE_ID = Joanna
POLLY_ENGINE = neural
```

---

## 🔧 Generate Random Secrets (for server/.env)

Run these commands in terminal:

```bash
# Generate API_KEY_SECRET
openssl rand -base64 32

# Generate JWT_SECRET
openssl rand -base64 32
```

Copy the output and paste into `server/.env`

---

## ✅ Configuration Steps

### Step 1: Collect All Keys (15-20 minutes)
- [ ] Open AWS Console
- [ ] Navigate to each service
- [ ] Copy each key/ID to this checklist
- [ ] Save this file for reference

### Step 2: Update Frontend Files (5 minutes)
- [ ] Open `.env` in project root
- [ ] Paste 7 values from checklist
- [ ] Open `src/lib/aws-config.ts`
- [ ] Update 5 fallback values
- [ ] Save both files

### Step 3: Update Backend Files (5 minutes) - OPTIONAL
- [ ] Open `server/.env`
- [ ] Paste 7 values from checklist
- [ ] Generate 2 random secrets
- [ ] Paste random secrets
- [ ] Save file

### Step 4: Update Lambda Functions (10 minutes)
- [ ] Open AWS Console → Lambda
- [ ] Update `mindcare-auth-handler` (3 variables)
- [ ] Update `mindcare-chat-handler` (7 variables)
- [ ] Update `mindcare-voice-handler` (5 variables)
- [ ] Click "Save" on each function

### Step 5: Test Configuration (10 minutes)
- [ ] Run `npm run dev`
- [ ] Open http://localhost:5173
- [ ] Try to sign up/login
- [ ] Check browser console for errors
- [ ] Test AI chat
- [ ] Test file upload

---

## 🚨 Common Issues

### Issue 1: "User pool does not exist"
**Solution:** Check `VITE_COGNITO_USER_POOL_ID` in `.env` matches AWS Console

### Issue 2: "Access denied to Bedrock"
**Solution:** AWS Console → Bedrock → Model access → Enable Claude 3 Sonnet

### Issue 3: "S3 bucket not found"
**Solution:** Check bucket names match exactly (case-sensitive)

### Issue 4: "Cannot connect to database"
**Solution:** Check Aurora cluster is running and security group allows connections

### Issue 5: "API Gateway 403"
**Solution:** Check API is deployed to `prod` stage and Cognito Authorizer is configured

---

## 📞 Quick Help

**If you get stuck:**
1. Check `AWS_KEYS_CONFIGURATION_GUIDE.md` for detailed instructions
2. Verify all keys are copied correctly (no extra spaces)
3. Restart dev server after updating `.env`
4. Check browser console for specific error messages
5. Verify AWS services are in `us-east-1` region

---

## 🎯 Success Criteria

You'll know configuration is complete when:
- ✅ Frontend starts without errors (`npm run dev`)
- ✅ You can sign up a new user
- ✅ You can log in successfully
- ✅ AI chat responds to messages
- ✅ File uploads work
- ✅ No AWS-related errors in browser console

---

**Total Time Estimate:** 30-45 minutes

**Difficulty:** Easy (just copy-paste)

**Once complete, your MindCare platform will be fully connected to AWS! 🚀**
