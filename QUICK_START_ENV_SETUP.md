# ⚡ Quick Start - Environment Setup

## 🎯 One File, 8 Keys, 5 Minutes

---

## Step 1: Open `.env` File

Location: **Project root directory**

If it doesn't exist, copy from template:
```bash
cp .env.example .env
```

---

## Step 2: Paste These 8 Values

```env
# 1. Cognito User Pool ID (from AWS Console → Cognito)
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX

# 2. Cognito Client ID (from User Pool → App clients)
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# 3. Cognito Identity Pool ID (from Cognito → Identity pools)
VITE_COGNITO_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# 4. API Gateway URL (from API Gateway → Stages → prod)
VITE_API_GATEWAY_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod

# 5. S3 Audio Bucket (from S3 → Buckets)
VITE_S3_AUDIO_BUCKET=mindcare-audio-uploads

# 6. S3 User Content Bucket (from S3 → Buckets)
VITE_S3_USER_CONTENT_BUCKET=mindcare-user-content

# 7. AWS Region (already set)
VITE_AWS_REGION=us-east-1

# 8. Bedrock Model ID (already set)
VITE_BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
```

---

## Step 3: Save & Run

```bash
npm run dev
```

---

## ✅ Done!

Your app is now connected to AWS services.

---

## 🔍 Quick Test

Open browser console (F12) and run:

```javascript
console.log(import.meta.env.VITE_COGNITO_USER_POOL_ID)
// Should show: us-east-1_XXXXXXXXX (your actual ID)
```

---

## 📍 Where to Find Keys

| Key | Location in AWS Console |
|-----|------------------------|
| User Pool ID | Cognito → User pools → mindcare-users |
| Client ID | User Pool → App integration → App clients |
| Identity Pool ID | Cognito → Identity pools → mindcare_identity_pool |
| API Gateway URL | API Gateway → MindCareAPI → Stages → prod |
| S3 Buckets | S3 → Buckets (list view) |

---

## 🔒 Security

- ✅ `.env` is in `.gitignore` (won't be committed)
- ✅ Only you have access to your keys
- ✅ Safe to share code on GitHub

---

## ⚠️ Troubleshooting

### "Cannot read property of undefined"
→ Check variable name in `.env` (case-sensitive)
→ Restart dev server after changes

### "User pool does not exist"
→ Verify User Pool ID is correct
→ Check region is us-east-1

### Changes not working
→ Stop server (Ctrl+C)
→ Start again: `npm run dev`

---

## 📚 More Help

- **Detailed Guide:** `ENV_CONFIGURATION_FINAL_GUIDE.md`
- **Paste Template:** `PASTE_YOUR_KEYS_HERE.md`
- **Code Changes:** `CODE_CHANGES_SUMMARY.md`

---

**That's it! Your environment is configured. 🎉**
