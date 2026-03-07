# 🎯 Visual Guide - Paste Your Keys Here

## 📁 File: `.env` (Project Root)

---

## 🔴 RED = You Need to Change These

## 🟢 GREEN = Already Correct, Don't Change

---

```env
# AWS Configuration - MindCare Frontend
# IMPORTANT: Keep this file secure and never commit to Git

# 🟢 AWS Credentials (Already correct - DON'T CHANGE)
VITE_AWS_ACCESS_KEY_ID=AKIAXGR5Q7QN6N6LFHTF
VITE_AWS_SECRET_ACCESS_KEY=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
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCOUNT_ID=495124020251

# 🔴 Amazon Cognito (CHANGE THESE 3 LINES)
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX          ← PASTE YOUR USER POOL ID HERE
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx      ← PASTE YOUR CLIENT ID HERE
VITE_COGNITO_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  ← PASTE YOUR IDENTITY POOL ID HERE

# 🔴 API Gateway (CHANGE THIS LINE)
VITE_API_GATEWAY_URL=http://localhost:8083             ← PASTE YOUR API GATEWAY URL HERE

# 🔴 Amazon S3 Buckets (VERIFY/CHANGE THESE 2 LINES)
VITE_S3_BUCKET=mindcare-user-content                   ← Can leave as is
VITE_S3_AUDIO_BUCKET=mindcare-audio-uploads            ← VERIFY THIS MATCHES YOUR BUCKET NAME
VITE_S3_USER_CONTENT_BUCKET=mindcare-user-content     ← VERIFY THIS MATCHES YOUR BUCKET NAME

# 🟢 AWS Secrets Manager (Optional - can leave as is)
VITE_DB_SECRET_NAME=mindcare/database/credentials
VITE_API_SECRET_NAME=mindcare/api/keys

# 🟡 CloudFront Distribution (OPTIONAL - only if you created CloudFront)
VITE_CLOUDFRONT_DOMAIN=d1234567890.cloudfront.net     ← PASTE YOUR CLOUDFRONT DOMAIN HERE (or leave as is)

# 🟢 Local Development (Already correct - DON'T CHANGE)
VITE_LOCAL_API_URL=http://localhost:8083
```

---

## 📝 Step-by-Step Instructions

### STEP 1: Open `.env` file
Location: Project root directory (same folder as `package.json`)

### STEP 2: Find Line 10 and paste your Cognito User Pool ID
```env
# Before:
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX

# After (example):
VITE_COGNITO_USER_POOL_ID=us-east-1_AbC123XyZ
```

### STEP 3: Find Line 11 and paste your Cognito Client ID
```env
# Before:
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# After (example):
VITE_COGNITO_CLIENT_ID=7h8i9j0k1l2m3n4o5p6q7r8s9t
```

### STEP 4: Find Line 12 and paste your Cognito Identity Pool ID
```env
# Before:
VITE_COGNITO_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# After (example):
VITE_COGNITO_IDENTITY_POOL_ID=us-east-1:a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6
```

### STEP 5: Find Line 15 and paste your API Gateway URL
```env
# Before:
VITE_API_GATEWAY_URL=http://localhost:8083

# After (example):
VITE_API_GATEWAY_URL=https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod
```

### STEP 6: Find Line 18 and verify/update your S3 audio bucket name
```env
# If your bucket name is exactly "mindcare-audio-uploads", leave as is:
VITE_S3_AUDIO_BUCKET=mindcare-audio-uploads

# If you added your account ID to make it unique, update it:
VITE_S3_AUDIO_BUCKET=mindcare-audio-uploads-495124020251
```

### STEP 7: Find Line 19 and verify/update your S3 user content bucket name
```env
# If your bucket name is exactly "mindcare-user-content", leave as is:
VITE_S3_USER_CONTENT_BUCKET=mindcare-user-content

# If you added your account ID to make it unique, update it:
VITE_S3_USER_CONTENT_BUCKET=mindcare-user-content-495124020251
```

### STEP 8: (Optional) Find Line 26 and paste CloudFront domain if you created it
```env
# If you created CloudFront:
VITE_CLOUDFRONT_DOMAIN=d3a1b2c3d4e5f6.cloudfront.net

# If you didn't create CloudFront, leave as is or delete this line
```

### STEP 9: Save the file
Press `Ctrl+S` (Windows) or `Cmd+S` (Mac)

### STEP 10: Restart dev server
```bash
# Stop the server (Ctrl+C)
# Start again
npm run dev
```

---

## 🎯 Quick Reference Table

| What You Need | Where to Find It | Where to Paste in .env |
|---------------|------------------|------------------------|
| **Cognito User Pool ID** | AWS Console → Cognito → User pools → mindcare-users | Line 10: `VITE_COGNITO_USER_POOL_ID=` |
| **Cognito Client ID** | User Pool → App integration → App clients → mindcare-web-client | Line 11: `VITE_COGNITO_CLIENT_ID=` |
| **Cognito Identity Pool ID** | AWS Console → Cognito → Identity pools → mindcare_identity_pool | Line 12: `VITE_COGNITO_IDENTITY_POOL_ID=` |
| **API Gateway URL** | AWS Console → API Gateway → MindCareAPI → Stages → prod | Line 15: `VITE_API_GATEWAY_URL=` |
| **S3 Audio Bucket** | AWS Console → S3 → Buckets | Line 18: `VITE_S3_AUDIO_BUCKET=` |
| **S3 User Content Bucket** | AWS Console → S3 → Buckets | Line 19: `VITE_S3_USER_CONTENT_BUCKET=` |
| **CloudFront Domain** (optional) | AWS Console → CloudFront → Distributions | Line 26: `VITE_CLOUDFRONT_DOMAIN=` |

---

## ✅ Checklist

- [ ] Line 10: Pasted Cognito User Pool ID
- [ ] Line 11: Pasted Cognito Client ID
- [ ] Line 12: Pasted Cognito Identity Pool ID
- [ ] Line 15: Pasted API Gateway URL
- [ ] Line 18: Verified S3 audio bucket name
- [ ] Line 19: Verified S3 user content bucket name
- [ ] Line 26: Pasted CloudFront domain (if created)
- [ ] Saved .env file
- [ ] Restarted dev server
- [ ] Tested in browser

---

## 🚀 Test It Works

After saving and restarting, open browser console (F12):

```javascript
// All should show your actual values (not undefined or X's)
console.log(import.meta.env.VITE_COGNITO_USER_POOL_ID);
console.log(import.meta.env.VITE_COGNITO_CLIENT_ID);
console.log(import.meta.env.VITE_API_GATEWAY_URL);
```

---

## 🎉 That's It!

**You only need to edit ONE file (`.env`) and change 6-7 lines.**

**All other code files automatically read from this .env file.**

**No other configuration needed!**
