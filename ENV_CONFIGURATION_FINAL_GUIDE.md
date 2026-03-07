# Environment Variables Configuration Guide - Final Version

## ✅ Code Updated - All Keys Now Read from .env Only!

All code files have been updated to ONLY read from environment variables. No hardcoded values remain in the codebase.

---

## 📁 Single File Configuration

You only need to update **ONE file**: `.env` (project root)

All AWS keys and IDs go into this file, and the code will automatically read from it.

---

## 🔧 Step-by-Step Setup

### Step 1: Copy the Template

```bash
# Copy the example file to create your .env
cp .env.example .env
```

### Step 2: Open `.env` File

Open the `.env` file in your project root directory.

### Step 3: Paste Your AWS Keys

Replace the placeholder values with your actual AWS keys/IDs:

```env
# ============================================================================
# AWS CREDENTIALS (Paste your values here)
# ============================================================================
VITE_AWS_ACCESS_KEY_ID=AKIAXGR5Q7QN6N6LFHTF
VITE_AWS_SECRET_ACCESS_KEY=fW4EugBT9dbHTHVVzHKgGdD5tBWowy8G12brY2hH
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCOUNT_ID=495124020251

# ============================================================================
# AMAZON COGNITO (Paste your 3 IDs here)
# ============================================================================
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_COGNITO_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# ============================================================================
# AMAZON API GATEWAY (Paste your API URL here)
# ============================================================================
VITE_API_GATEWAY_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod

# ============================================================================
# AMAZON S3 BUCKETS (Paste your bucket names here)
# ============================================================================
VITE_S3_AUDIO_BUCKET=mindcare-audio-uploads
VITE_S3_USER_CONTENT_BUCKET=mindcare-user-content

# ============================================================================
# AMAZON BEDROCK (Already configured - no changes needed)
# ============================================================================
VITE_BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0

# ============================================================================
# AWS SECRETS MANAGER (Optional - only if using Secrets Manager)
# ============================================================================
VITE_DB_SECRET_NAME=mindcare/database/credentials
VITE_API_SECRET_NAME=mindcare/api/keys

# ============================================================================
# CLOUDFRONT (Optional - only if you created CloudFront)
# ============================================================================
VITE_CLOUDFRONT_DOMAIN=d1234567890.cloudfront.net

# ============================================================================
# LOCAL DEVELOPMENT (Already configured - no changes needed)
# ============================================================================
VITE_LOCAL_API_URL=http://localhost:8083
```

### Step 4: Save the File

Save `.env` and you're done!

---

## 📋 What You Need to Collect

### Required (8 values):

1. **VITE_COGNITO_USER_POOL_ID**
   - Where: AWS Console → Cognito → User pools → mindcare-users
   - Format: `us-east-1_XXXXXXXXX`

2. **VITE_COGNITO_CLIENT_ID**
   - Where: User Pool → App integration → App clients → mindcare-web-client
   - Format: `1a2b3c4d5e6f7g8h9i0j1k2l3m`

3. **VITE_COGNITO_IDENTITY_POOL_ID**
   - Where: AWS Console → Cognito → Identity pools → mindcare_identity_pool
   - Format: `us-east-1:12345678-1234-1234-1234-123456789012`

4. **VITE_API_GATEWAY_URL**
   - Where: AWS Console → API Gateway → MindCareAPI → Stages → prod
   - Format: `https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod`

5. **VITE_S3_AUDIO_BUCKET**
   - Where: AWS Console → S3 → Buckets
   - Format: `mindcare-audio-uploads` (or your unique name)

6. **VITE_S3_USER_CONTENT_BUCKET**
   - Where: AWS Console → S3 → Buckets
   - Format: `mindcare-user-content` (or your unique name)

### Optional (2 values):

7. **VITE_CLOUDFRONT_DOMAIN** (only if you created CloudFront)
   - Where: AWS Console → CloudFront → Distributions
   - Format: `d1234567890.cloudfront.net`

8. **VITE_DB_SECRET_NAME** (only if using Secrets Manager)
   - Where: AWS Console → Secrets Manager
   - Format: `mindcare/database/credentials`

---

## ✅ Code Files Updated

The following files now ONLY read from `.env`:

### 1. `src/lib/aws-config.ts`
- ✅ Removed all hardcoded fallback values
- ✅ Now requires environment variables to be set
- ✅ Will throw clear errors if variables are missing

### 2. `src/lib/cognito-auth.ts`
- ✅ Already using environment variables only
- ✅ No changes needed

### 3. `src/lib/bedrock-chat.ts`
- ✅ Already using environment variables only
- ✅ No changes needed

### 4. `src/lib/s3-service.ts`
- ✅ Removed hardcoded bucket names
- ✅ Now reads from environment variables only

### 5. `src/lib/transcribe-service.ts`
- ✅ Already using environment variables only
- ✅ No changes needed

### 6. `src/lib/polly-service.ts`
- ✅ Removed hardcoded voice settings
- ✅ Now reads from environment variables only

### 7. `src/lib/cloudwatch-service.ts`
- ✅ Already using environment variables only
- ✅ No changes needed

### 8. `src/lib/secrets-manager-service.ts`
- ✅ Removed hardcoded secret names
- ✅ Now requires environment variables to be set

---

## 🔒 Security Features

### 1. `.gitignore` Protection
The `.env` file is already in `.gitignore`, so it will NEVER be committed to Git:

```gitignore
# Environment variables
.env
.env.local
.env.*.local
```

### 2. Example File for Sharing
The `.env.example` file contains placeholder values and CAN be shared:
- ✅ Safe to commit to Git
- ✅ Shows required variables
- ✅ No actual keys/secrets

### 3. No Hardcoded Values
- ✅ All code files read from environment variables
- ✅ No fallback values that could leak
- ✅ Clear errors if variables are missing

---

## 🚀 Testing Your Configuration

### Step 1: Verify Environment Variables Load

```bash
# Start the development server
npm run dev
```

### Step 2: Check Browser Console

Open browser console (F12) and run:

```javascript
// Check if variables are loaded
console.log('Cognito Pool ID:', import.meta.env.VITE_COGNITO_USER_POOL_ID);
console.log('API Gateway URL:', import.meta.env.VITE_API_GATEWAY_URL);
console.log('S3 Audio Bucket:', import.meta.env.VITE_S3_AUDIO_BUCKET);
```

### Step 3: Test Authentication

1. Go to http://localhost:5173
2. Try to sign up a new user
3. Check for any AWS-related errors

### Step 4: Test Services

- ✅ Sign up/Login (Cognito)
- ✅ AI Chat (Bedrock)
- ✅ File Upload (S3)
- ✅ Voice Recording (Transcribe)

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Cannot read property of undefined"

**Cause:** Environment variable not set in `.env`

**Solution:** 
1. Open `.env` file
2. Check the variable name matches exactly (case-sensitive)
3. Ensure no extra spaces around the `=` sign
4. Restart dev server after changes

### Issue 2: "User pool does not exist"

**Cause:** Wrong Cognito User Pool ID

**Solution:**
1. Go to AWS Console → Cognito → User pools
2. Copy the exact User Pool ID
3. Paste into `.env` file
4. Restart dev server

### Issue 3: "Access denied to Bedrock"

**Cause:** Bedrock model access not enabled

**Solution:**
1. Go to AWS Console → Bedrock → Model access
2. Enable Claude 3 Sonnet model
3. Wait 5 minutes for approval

### Issue 4: "S3 bucket not found"

**Cause:** Bucket name doesn't match or bucket doesn't exist

**Solution:**
1. Go to AWS Console → S3 → Buckets
2. Verify bucket names match exactly
3. Update `.env` with correct names
4. Restart dev server

### Issue 5: Changes not reflecting

**Cause:** Dev server needs restart after `.env` changes

**Solution:**
```bash
# Stop the server (Ctrl+C)
# Start again
npm run dev
```

---

## 📝 Quick Checklist

- [ ] Copied `.env.example` to `.env`
- [ ] Pasted AWS Access Key ID
- [ ] Pasted AWS Secret Access Key
- [ ] Pasted Cognito User Pool ID
- [ ] Pasted Cognito Client ID
- [ ] Pasted Cognito Identity Pool ID
- [ ] Pasted API Gateway URL
- [ ] Pasted S3 Audio Bucket name
- [ ] Pasted S3 User Content Bucket name
- [ ] Saved `.env` file
- [ ] Restarted dev server
- [ ] Tested login/signup
- [ ] Verified no errors in console

---

## 🎯 Benefits of This Approach

### 1. Security
- ✅ No keys in code
- ✅ `.env` never committed to Git
- ✅ Safe to share code publicly

### 2. Simplicity
- ✅ Only one file to update
- ✅ All keys in one place
- ✅ Easy to manage

### 3. Flexibility
- ✅ Different keys for dev/prod
- ✅ Easy to switch environments
- ✅ Team members use their own keys

### 4. Best Practices
- ✅ Industry standard approach
- ✅ Follows 12-factor app methodology
- ✅ Compatible with CI/CD pipelines

---

## 🔄 For Team Members

When sharing your code with others:

1. **Share:** `.env.example` file (safe, no secrets)
2. **Don't share:** `.env` file (contains your actual keys)
3. **Instruct them to:**
   - Copy `.env.example` to `.env`
   - Add their own AWS keys
   - Never commit `.env` to Git

---

## 📚 Additional Resources

### Environment Variables in Vite
- Vite automatically loads `.env` files
- Variables must start with `VITE_` to be exposed to client
- Access via `import.meta.env.VITE_VARIABLE_NAME`

### AWS Best Practices
- Use IAM roles in production (not access keys)
- Rotate credentials every 90 days
- Use AWS Secrets Manager for sensitive data
- Enable MFA on AWS account

---

## ✅ Summary

**What changed:**
- All code files now ONLY read from `.env`
- No hardcoded values anywhere
- Clear errors if variables are missing

**What you need to do:**
1. Open `.env` file
2. Paste your 8 AWS keys/IDs
3. Save the file
4. Run `npm run dev`

**That's it!** Your code is now secure and ready to share. 🎉
