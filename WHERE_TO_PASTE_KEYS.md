# 🔑 Where to Paste Each AWS Key/ID in .env File

## 📁 File Location: `.env` (Project Root Directory)

---

## 📋 Complete List - Copy This Entire Block

Open your `.env` file and paste this complete template with your actual values:

```env
# ============================================================================
# 1. AWS CREDENTIALS (You already have these)
# ============================================================================
VITE_AWS_ACCESS_KEY_ID=AKIAXGR5Q7QN6N6LFHTF
VITE_AWS_SECRET_ACCESS_KEY=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
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCOUNT_ID=495124020251

# ============================================================================
# 2. AMAZON COGNITO - Authentication Service
# ============================================================================
# Paste your Cognito User Pool ID here (from AWS Console → Cognito → User pools)
VITE_COGNITO_USER_POOL_ID=

# Paste your Cognito App Client ID here (from User Pool → App integration → App clients)
VITE_COGNITO_CLIENT_ID=

# Paste your Cognito Identity Pool ID here (from AWS Console → Cognito → Identity pools)
VITE_COGNITO_IDENTITY_POOL_ID=

# ============================================================================
# 3. AMAZON API GATEWAY - REST API
# ============================================================================
# Paste your API Gateway URL here (from AWS Console → API Gateway → Stages → prod)
VITE_API_GATEWAY_URL=

# ============================================================================
# 4. AMAZON S3 - File Storage
# ============================================================================
# Paste your S3 audio bucket name here (from AWS Console → S3 → Buckets)
VITE_S3_AUDIO_BUCKET=

# Paste your S3 user content bucket name here (from AWS Console → S3 → Buckets)
VITE_S3_USER_CONTENT_BUCKET=

# ============================================================================
# 5. AMAZON BEDROCK - AI Service (Already configured)
# ============================================================================
VITE_BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0

# ============================================================================
# 6. AWS SECRETS MANAGER (Optional - only if using)
# ============================================================================
VITE_DB_SECRET_NAME=mindcare/database/credentials
VITE_API_SECRET_NAME=mindcare/api/keys

# ============================================================================
# 7. CLOUDFRONT CDN (Optional - only if created)
# ============================================================================
VITE_CLOUDFRONT_DOMAIN=

# ============================================================================
# 8. LOCAL DEVELOPMENT (Already configured)
# ============================================================================
VITE_LOCAL_API_URL=http://localhost:8083
```

---

## 📝 Detailed Instructions for Each Key

### KEY 1: VITE_COGNITO_USER_POOL_ID

**What it is:** Your Cognito User Pool ID for authentication

**Where to find it:**
1. Go to AWS Console
2. Navigate to: **Cognito** service
3. Click: **User pools**
4. Click: **mindcare-users** (your user pool)
5. Look for: **User pool ID** at the top
6. Copy the value (format: `us-east-1_XXXXXXXXX`)

**Where to paste in .env:**
```env
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
```

**Example:**
```env
VITE_COGNITO_USER_POOL_ID=us-east-1_AbC123XyZ
```

---

### KEY 2: VITE_COGNITO_CLIENT_ID

**What it is:** Your Cognito App Client ID

**Where to find it:**
1. Go to AWS Console → Cognito → User pools → mindcare-users
2. Click: **App integration** tab
3. Scroll down to: **App clients and analytics**
4. Click: **mindcare-web-client**
5. Copy: **Client ID** (format: `1a2b3c4d5e6f7g8h9i0j1k2l3m`)

**Where to paste in .env:**
```env
VITE_COGNITO_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j1k2l3m
```

**Example:**
```env
VITE_COGNITO_CLIENT_ID=7h8i9j0k1l2m3n4o5p6q7r8s9t
```

---

### KEY 3: VITE_COGNITO_IDENTITY_POOL_ID

**What it is:** Your Cognito Identity Pool ID

**Where to find it:**
1. Go to AWS Console
2. Navigate to: **Cognito** service
3. Click: **Identity pools** (left sidebar)
4. Click: **mindcare_identity_pool**
5. Copy: **Identity pool ID** (format: `us-east-1:12345678-1234-1234-1234-123456789012`)

**Where to paste in .env:**
```env
VITE_COGNITO_IDENTITY_POOL_ID=us-east-1:12345678-1234-1234-1234-123456789012
```

**Example:**
```env
VITE_COGNITO_IDENTITY_POOL_ID=us-east-1:a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6
```

---

### KEY 4: VITE_API_GATEWAY_URL

**What it is:** Your API Gateway endpoint URL

**Where to find it:**
1. Go to AWS Console
2. Navigate to: **API Gateway** service
3. Click: **APIs** (left sidebar)
4. Click: **MindCareAPI**
5. Click: **Stages** (left sidebar)
6. Click: **prod** stage
7. Copy: **Invoke URL** at the top (format: `https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod`)

**Where to paste in .env:**
```env
VITE_API_GATEWAY_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod
```

**Example:**
```env
VITE_API_GATEWAY_URL=https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod
```

---

### KEY 5: VITE_S3_AUDIO_BUCKET

**What it is:** Your S3 bucket name for audio files

**Where to find it:**
1. Go to AWS Console
2. Navigate to: **S3** service
3. Look in: **Buckets** list
4. Find: Your audio bucket (e.g., `mindcare-audio-uploads`)
5. Copy: The exact bucket name

**Where to paste in .env:**
```env
VITE_S3_AUDIO_BUCKET=mindcare-audio-uploads
```

**Example:**
```env
VITE_S3_AUDIO_BUCKET=mindcare-audio-uploads-495124020251
```

**Note:** If you used a different name (to make it unique), use that exact name.

---

### KEY 6: VITE_S3_USER_CONTENT_BUCKET

**What it is:** Your S3 bucket name for user content (profile pictures, documents)

**Where to find it:**
1. Go to AWS Console
2. Navigate to: **S3** service
3. Look in: **Buckets** list
4. Find: Your user content bucket (e.g., `mindcare-user-content`)
5. Copy: The exact bucket name

**Where to paste in .env:**
```env
VITE_S3_USER_CONTENT_BUCKET=mindcare-user-content
```

**Example:**
```env
VITE_S3_USER_CONTENT_BUCKET=mindcare-user-content-495124020251
```

---

### KEY 7: VITE_CLOUDFRONT_DOMAIN (Optional)

**What it is:** Your CloudFront distribution domain (only if you created CloudFront)

**Where to find it:**
1. Go to AWS Console
2. Navigate to: **CloudFront** service
3. Look in: **Distributions** list
4. Copy: **Domain name** (format: `d1234567890.cloudfront.net`)

**Where to paste in .env:**
```env
VITE_CLOUDFRONT_DOMAIN=d1234567890.cloudfront.net
```

**Example:**
```env
VITE_CLOUDFRONT_DOMAIN=d3a1b2c3d4e5f6.cloudfront.net
```

**Note:** Leave blank if you didn't create CloudFront.

---

## ✅ Final .env File Example

Here's what your complete `.env` file should look like with all values filled in:

```env
# ============================================================================
# AWS CREDENTIALS
# ============================================================================
VITE_AWS_ACCESS_KEY_ID=AKIAXGR5Q7QN6N6LFHTF
VITE_AWS_SECRET_ACCESS_KEY=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
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCOUNT_ID=495124020251

# ============================================================================
# AMAZON COGNITO
# ============================================================================
VITE_COGNITO_USER_POOL_ID=us-east-1_AbC123XyZ
VITE_COGNITO_CLIENT_ID=7h8i9j0k1l2m3n4o5p6q7r8s9t
VITE_COGNITO_IDENTITY_POOL_ID=us-east-1:a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6

# ============================================================================
# AMAZON API GATEWAY
# ============================================================================
VITE_API_GATEWAY_URL=https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod

# ============================================================================
# AMAZON S3
# ============================================================================
VITE_S3_AUDIO_BUCKET=mindcare-audio-uploads-495124020251
VITE_S3_USER_CONTENT_BUCKET=mindcare-user-content-495124020251

# ============================================================================
# AMAZON BEDROCK
# ============================================================================
VITE_BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0

# ============================================================================
# AWS SECRETS MANAGER (Optional)
# ============================================================================
VITE_DB_SECRET_NAME=mindcare/database/credentials
VITE_API_SECRET_NAME=mindcare/api/keys

# ============================================================================
# CLOUDFRONT (Optional)
# ============================================================================
VITE_CLOUDFRONT_DOMAIN=d3a1b2c3d4e5f6.cloudfront.net

# ============================================================================
# LOCAL DEVELOPMENT
# ============================================================================
VITE_LOCAL_API_URL=http://localhost:8083
```

---

## 🎯 Quick Checklist

After pasting all your keys, verify:

- [ ] VITE_COGNITO_USER_POOL_ID starts with `us-east-1_`
- [ ] VITE_COGNITO_CLIENT_ID is a long alphanumeric string
- [ ] VITE_COGNITO_IDENTITY_POOL_ID starts with `us-east-1:` and has dashes
- [ ] VITE_API_GATEWAY_URL starts with `https://` and ends with `/prod`
- [ ] VITE_S3_AUDIO_BUCKET is your exact bucket name (no https://)
- [ ] VITE_S3_USER_CONTENT_BUCKET is your exact bucket name (no https://)
- [ ] No extra spaces before or after the `=` sign
- [ ] No quotes around the values
- [ ] File is saved

---

## 🚀 Test Your Configuration

After saving `.env`, run:

```bash
npm run dev
```

Then open browser console (F12) and check:

```javascript
console.log('Cognito Pool:', import.meta.env.VITE_COGNITO_USER_POOL_ID);
console.log('API Gateway:', import.meta.env.VITE_API_GATEWAY_URL);
console.log('S3 Audio:', import.meta.env.VITE_S3_AUDIO_BUCKET);
```

All should show your actual values (not `undefined`).

---

## ⚠️ Common Mistakes to Avoid

### ❌ Wrong:
```env
VITE_COGNITO_USER_POOL_ID = us-east-1_AbC123XyZ  # Extra spaces
VITE_API_GATEWAY_URL="https://abc.com/prod"      # Quotes not needed
VITE_S3_AUDIO_BUCKET=https://mindcare-audio...   # Don't include https://
```

### ✅ Correct:
```env
VITE_COGNITO_USER_POOL_ID=us-east-1_AbC123XyZ
VITE_API_GATEWAY_URL=https://abc.com/prod
VITE_S3_AUDIO_BUCKET=mindcare-audio-uploads
```

---

## 🔒 Security Reminder

- ✅ `.env` is in `.gitignore` (won't be committed to Git)
- ✅ Never share your `.env` file
- ✅ Never commit `.env` to GitHub
- ✅ Only share `.env.example` (template with placeholders)

---

## 📞 Need Help?

If you get errors:

1. **"Cannot read property of undefined"**
   - Check variable name is spelled correctly
   - Restart dev server: Stop (Ctrl+C) and run `npm run dev` again

2. **"User pool does not exist"**
   - Verify VITE_COGNITO_USER_POOL_ID is correct
   - Check it starts with `us-east-1_`

3. **"S3 bucket not found"**
   - Verify bucket names match exactly (case-sensitive)
   - Don't include `https://` or `s3://`

4. **Changes not working**
   - Always restart dev server after editing `.env`
   - Clear browser cache (Ctrl+Shift+R)

---

## ✅ Summary

**Total keys to paste: 6 required + 1 optional**

**Required (6):**
1. VITE_COGNITO_USER_POOL_ID
2. VITE_COGNITO_CLIENT_ID
3. VITE_COGNITO_IDENTITY_POOL_ID
4. VITE_API_GATEWAY_URL
5. VITE_S3_AUDIO_BUCKET
6. VITE_S3_USER_CONTENT_BUCKET

**Optional (1):**
7. VITE_CLOUDFRONT_DOMAIN

**Already configured (4):**
- VITE_AWS_ACCESS_KEY_ID
- VITE_AWS_SECRET_ACCESS_KEY
- VITE_AWS_REGION
- VITE_BEDROCK_MODEL_ID

---

**Once all keys are pasted, save the file and run `npm run dev` - You're done! 🎉**
