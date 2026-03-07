# 📝 Simple Paste Guide - .env File

## 🎯 Your .env File is Here: Project Root Directory

---

## ✏️ What to Do: Replace the X's with Your Actual Values

Open your `.env` file and replace these 6 lines:

---

### LINE 10: Replace this line
```env
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
```

**With your actual Cognito User Pool ID:**
```env
VITE_COGNITO_USER_POOL_ID=us-east-1_YourActualID
```

**Where to find it:** AWS Console → Cognito → User pools → mindcare-users → Copy "User pool ID"

---

### LINE 11: Replace this line
```env
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

**With your actual Cognito Client ID:**
```env
VITE_COGNITO_CLIENT_ID=YourActualClientID
```

**Where to find it:** User Pool → App integration → App clients → mindcare-web-client → Copy "Client ID"

---

### LINE 12: Replace this line
```env
VITE_COGNITO_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**With your actual Identity Pool ID:**
```env
VITE_COGNITO_IDENTITY_POOL_ID=us-east-1:your-actual-id-here
```

**Where to find it:** AWS Console → Cognito → Identity pools → mindcare_identity_pool → Copy "Identity pool ID"

---

### LINE 15: Replace this line
```env
VITE_API_GATEWAY_URL=http://localhost:8083
```

**With your actual API Gateway URL:**
```env
VITE_API_GATEWAY_URL=https://yourapi.execute-api.us-east-1.amazonaws.com/prod
```

**Where to find it:** AWS Console → API Gateway → MindCareAPI → Stages → prod → Copy "Invoke URL"

---

### LINE 18: Replace this line (if different)
```env
VITE_S3_AUDIO_BUCKET=mindcare-audio-uploads
```

**With your actual S3 audio bucket name:**
```env
VITE_S3_AUDIO_BUCKET=your-actual-audio-bucket-name
```

**Where to find it:** AWS Console → S3 → Buckets → Copy your audio bucket name

**Note:** If you used `mindcare-audio-uploads`, leave it as is. If you added your account ID to make it unique (e.g., `mindcare-audio-uploads-495124020251`), use that.

---

### LINE 19: Replace this line (if different)
```env
VITE_S3_USER_CONTENT_BUCKET=mindcare-user-content
```

**With your actual S3 user content bucket name:**
```env
VITE_S3_USER_CONTENT_BUCKET=your-actual-content-bucket-name
```

**Where to find it:** AWS Console → S3 → Buckets → Copy your user content bucket name

**Note:** If you used `mindcare-user-content`, leave it as is. If you added your account ID (e.g., `mindcare-user-content-495124020251`), use that.

---

### LINE 26 (Optional): Replace this line if you created CloudFront
```env
VITE_CLOUDFRONT_DOMAIN=d1234567890.cloudfront.net
```

**With your actual CloudFront domain:**
```env
VITE_CLOUDFRONT_DOMAIN=your-actual-cloudfront-domain.cloudfront.net
```

**Where to find it:** AWS Console → CloudFront → Distributions → Copy "Domain name"

**Note:** If you didn't create CloudFront, leave this line as is or delete it.

---

## ✅ Lines You DON'T Need to Change

These are already correct:

```env
# Line 5 - Already set
VITE_AWS_ACCESS_KEY_ID=AKIAXGR5Q7QN6N6LFHTF

# Line 6 - Already set
VITE_AWS_SECRET_ACCESS_KEY=fW4EugBT9dbHTHVVzHKgGdD5tBWowy8G12brY2hH

# Line 7 - Already set
VITE_AWS_REGION=us-east-1

# Line 8 - Already set
VITE_AWS_ACCOUNT_ID=495124020251

# Line 17 - Can leave as is (duplicate of line 19)
VITE_S3_BUCKET=mindcare-user-content

# Line 22 - Optional, leave as is
VITE_DB_SECRET_NAME=mindcare/database/credentials

# Line 23 - Optional, leave as is
VITE_API_SECRET_NAME=mindcare/api/keys

# Line 29 - Already set
VITE_LOCAL_API_URL=http://localhost:8083
```

---

## 📋 Quick Summary

**You need to update 6 lines in your .env file:**

| Line | Variable Name | What to Replace |
|------|---------------|-----------------|
| 10 | VITE_COGNITO_USER_POOL_ID | Replace X's with your User Pool ID |
| 11 | VITE_COGNITO_CLIENT_ID | Replace X's with your Client ID |
| 12 | VITE_COGNITO_IDENTITY_POOL_ID | Replace X's with your Identity Pool ID |
| 15 | VITE_API_GATEWAY_URL | Replace localhost with your API Gateway URL |
| 18 | VITE_S3_AUDIO_BUCKET | Verify/update your audio bucket name |
| 19 | VITE_S3_USER_CONTENT_BUCKET | Verify/update your content bucket name |

**Optional:**
| Line | Variable Name | What to Replace |
|------|---------------|-----------------|
| 26 | VITE_CLOUDFRONT_DOMAIN | Replace with your CloudFront domain (if created) |

---

## 🚀 After Pasting

1. **Save the .env file** (Ctrl+S or Cmd+S)
2. **Restart your dev server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Start again
   npm run dev
   ```
3. **Test in browser:** Open http://localhost:5173

---

## ✅ Verification

Open browser console (F12) and run:

```javascript
console.log('Pool ID:', import.meta.env.VITE_COGNITO_USER_POOL_ID);
console.log('Client ID:', import.meta.env.VITE_COGNITO_CLIENT_ID);
console.log('API URL:', import.meta.env.VITE_API_GATEWAY_URL);
```

All should show your actual values (not the X's).

---

## 🎉 Done!

Once you've replaced those 6 lines and saved the file, your AWS services are integrated!

**No other files need to be edited - everything reads from this .env file automatically.**
