# 🔑 Paste Your AWS Keys Here

## ⚡ Quick Setup (5 Minutes)

### Step 1: Open `.env` File
Location: Project root directory

### Step 2: Paste Your Keys

Copy this template and fill in your values:

```env
# ============================================================================
# 1. AWS CREDENTIALS (You already have these)
# ============================================================================
VITE_AWS_ACCESS_KEY_ID=AKIAXGR5Q7QN6N6LFHTF
VITE_AWS_SECRET_ACCESS_KEY=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
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCOUNT_ID=495124020251

# ============================================================================
# 2. COGNITO (Get from AWS Console → Cognito)
# ============================================================================
VITE_COGNITO_USER_POOL_ID=_______________________________
# Example: us-east-1_AbC123XyZ

VITE_COGNITO_CLIENT_ID=_______________________________
# Example: 1a2b3c4d5e6f7g8h9i0j1k2l3m

VITE_COGNITO_IDENTITY_POOL_ID=_______________________________
# Example: us-east-1:12345678-1234-1234-1234-123456789012

# ============================================================================
# 3. API GATEWAY (Get from AWS Console → API Gateway → Stages → prod)
# ============================================================================
VITE_API_GATEWAY_URL=_______________________________
# Example: https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod

# ============================================================================
# 4. S3 BUCKETS (Get from AWS Console → S3 → Buckets)
# ============================================================================
VITE_S3_AUDIO_BUCKET=_______________________________
# Example: mindcare-audio-uploads

VITE_S3_USER_CONTENT_BUCKET=_______________________________
# Example: mindcare-user-content

# ============================================================================
# 5. BEDROCK (Already configured - no changes needed)
# ============================================================================
VITE_BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0

# ============================================================================
# 6. OPTIONAL (Only if you created these)
# ============================================================================
VITE_CLOUDFRONT_DOMAIN=_______________________________
# Example: d1234567890.cloudfront.net

VITE_DB_SECRET_NAME=mindcare/database/credentials
VITE_API_SECRET_NAME=mindcare/api/keys

# ============================================================================
# 7. LOCAL DEVELOPMENT (Already configured - no changes needed)
# ============================================================================
VITE_LOCAL_API_URL=http://localhost:8083
```

### Step 3: Save & Test

```bash
# Save the .env file
# Then run:
npm run dev
```

---

## 📍 Where to Find Each Key

### 1. Cognito User Pool ID
```
AWS Console → Cognito → User pools → mindcare-users
Look for: "User pool ID"
Format: us-east-1_XXXXXXXXX
```

### 2. Cognito Client ID
```
AWS Console → Cognito → User pools → mindcare-users
→ App integration tab → App clients → mindcare-web-client
Look for: "Client ID"
Format: 1a2b3c4d5e6f7g8h9i0j1k2l3m
```

### 3. Cognito Identity Pool ID
```
AWS Console → Cognito → Identity pools → mindcare_identity_pool
Look for: "Identity pool ID"
Format: us-east-1:12345678-1234-1234-1234-123456789012
```

### 4. API Gateway URL
```
AWS Console → API Gateway → APIs → MindCareAPI
→ Stages → prod
Look for: "Invoke URL" at the top
Format: https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod
```

### 5. S3 Bucket Names
```
AWS Console → S3 → Buckets
Look for: Your bucket names in the list
Format: mindcare-audio-uploads, mindcare-user-content
```

### 6. CloudFront Domain (Optional)
```
AWS Console → CloudFront → Distributions
Look for: "Domain name" column
Format: d1234567890.cloudfront.net
```

---

## ✅ Verification

After pasting your keys, verify they work:

```bash
# 1. Start dev server
npm run dev

# 2. Open browser console (F12)
# 3. Run these commands:
console.log(import.meta.env.VITE_COGNITO_USER_POOL_ID)
console.log(import.meta.env.VITE_API_GATEWAY_URL)

# 4. Should see your actual values (not undefined)
```

---

## 🔒 Security Reminder

- ✅ `.env` is in `.gitignore` (won't be committed)
- ✅ Never share your `.env` file
- ✅ Only share `.env.example` (has placeholders)
- ✅ Each team member uses their own keys

---

## 🎯 That's It!

Once you paste your 8 keys into `.env`, everything will work automatically.

The code reads ONLY from `.env` - no hardcoded values anywhere!
