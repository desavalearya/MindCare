# MindCare AWS Setup - Secure Configuration Guide

## 🔒 Security First

**IMPORTANT**: The credentials you shared publicly are now compromised. Please rotate them immediately before proceeding.

## Step 1: Secure Your AWS Account (DO THIS FIRST!)

### A. Rotate Compromised Access Keys
1. Go to: https://console.aws.amazon.com/iam/
2. Sign in with root account
3. Navigate to: IAM → Users → dhruv → Security credentials
4. Find access key: `AKIAXGR5Q7QN6N6LHFTF`
5. Click "Deactivate" → "Delete"
6. Click "Create access key"
7. Download the new credentials
8. **Save them securely** (password manager, not in chat/email)

### B. Enable MFA (Multi-Factor Authentication)
1. IAM → Users → dhruv → Security credentials
2. Click "Assign MFA device"
3. Use Google Authenticator or Authy app
4. Scan QR code and enter two consecutive codes

### C. Change Passwords
1. Change root password
2. Change IAM user password
3. Use strong, unique passwords

## Step 2: Configure AWS CLI

```bash
# Install AWS CLI if not already installed
# Windows: Download from https://aws.amazon.com/cli/
# Mac: brew install awscli
# Linux: sudo apt install awscli

# Configure with NEW credentials
aws configure

# Enter when prompted:
# AWS Access Key ID: [Your NEW access key]
# AWS Secret Access Key: [Your NEW secret key]
# Default region name: us-east-1
# Default output format: json

# Test configuration
aws sts get-caller-identity
```

## Step 3: Create AWS Resources

### A. Create Cognito User Pool

```bash
# Via AWS Console (easier for first time):
# 1. Go to: https://console.aws.amazon.com/cognito/
# 2. Click "Create user pool"
# 3. Configure sign-in options:
#    - Email
# 4. Password policy:
#    - Minimum length: 8
#    - Require uppercase, lowercase, numbers, special characters
# 5. Email verification: Required
# 6. User pool name: mindcare-users
# 7. App client name: mindcare-web
# 8. Create pool
# 9. Copy User Pool ID (looks like: us-east-1_XXXXXXXXX)
# 10. Copy App Client ID (looks like: xxxxxxxxxxxxxxxxxxxxxxxxxx)

# Or via CLI:
aws cognito-idp create-user-pool \
  --pool-name mindcare-users \
  --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=true}" \
  --auto-verified-attributes email \
  --username-attributes email \
  --region us-east-1

# Create app client:
aws cognito-idp create-user-pool-client \
  --user-pool-id YOUR_USER_POOL_ID \
  --client-name mindcare-web \
  --no-generate-secret \
  --region us-east-1
```

### B. Create User Groups in Cognito

```bash
# Create 'user' group
aws cognito-idp create-group \
  --group-name user \
  --user-pool-id YOUR_USER_POOL_ID \
  --description "Regular users" \
  --precedence 3 \
  --region us-east-1

# Create 'counsellor' group
aws cognito-idp create-group \
  --group-name counsellor \
  --user-pool-id YOUR_USER_POOL_ID \
  --description "Counsellors" \
  --precedence 2 \
  --region us-east-1

# Create 'admin' group
aws cognito-idp create-group \
  --group-name admin \
  --user-pool-id YOUR_USER_POOL_ID \
  --description "Administrators" \
  --precedence 1 \
  --region us-east-1
```

### C. Create S3 Buckets

```bash
# Create audio uploads bucket
aws s3 mb s3://mindcare-audio-uploads-495124020251 --region us-east-1

# Create user content bucket
aws s3 mb s3://mindcare-user-content-495124020251 --region us-east-1

# Note: Added account ID to bucket names for uniqueness
```

### D. Configure S3 CORS

Create a file `cors-config.json`:
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["http://localhost:5173", "http://localhost:8083"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

Apply CORS:
```bash
aws s3api put-bucket-cors \
  --bucket mindcare-audio-uploads-495124020251 \
  --cors-configuration file://cors-config.json

aws s3api put-bucket-cors \
  --bucket mindcare-user-content-495124020251 \
  --cors-configuration file://cors-config.json
```

### E. Enable Bedrock Model Access

```bash
# Via AWS Console (required for first time):
# 1. Go to: https://console.aws.amazon.com/bedrock/
# 2. Click "Model access" in left sidebar
# 3. Click "Manage model access"
# 4. Find "Anthropic" section
# 5. Check "Claude 3 Sonnet"
# 6. Click "Request model access"
# 7. Wait for approval (usually instant)

# Verify access:
aws bedrock list-foundation-models --region us-east-1 | grep claude
```

## Step 4: Update Environment Files

### Frontend `.env`
```bash
# Edit the .env file in project root
# Replace these values:

VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX  # From Step 3A
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx  # From Step 3A
VITE_S3_AUDIO_BUCKET=mindcare-audio-uploads-495124020251
VITE_S3_USER_CONTENT_BUCKET=mindcare-user-content-495124020251
```

### Backend `server/.env`
```bash
# Edit the server/.env file
# Replace these values:

AWS_ACCESS_KEY_ID=YOUR_NEW_ACCESS_KEY  # From Step 1A
AWS_SECRET_ACCESS_KEY=YOUR_NEW_SECRET_KEY  # From Step 1A
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX  # From Step 3A
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx  # From Step 3A
S3_AUDIO_BUCKET=mindcare-audio-uploads-495124020251
S3_USER_CONTENT_BUCKET=mindcare-user-content-495124020251
DB_PASSWORD=your_mysql_password  # Your MySQL password
```

## Step 5: Run Database Migrations

```bash
# Make sure MySQL is running
# Then run:

mysql -h localhost -u root -p mindcare < server/db/migrations.sql

# Or if using a remote database:
mysql -h your-db-host -u your-user -p mindcare < server/db/migrations.sql
```

## Step 6: Test AWS Connectivity

```bash
# Test AWS CLI
aws sts get-caller-identity

# Test Cognito
aws cognito-idp list-user-pools --max-results 10 --region us-east-1

# Test S3
aws s3 ls

# Test Bedrock (should not error)
aws bedrock list-foundation-models --region us-east-1
```

## Step 7: Start Development Servers

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd server
npm start
```

## Step 8: Test the Integration

1. Open browser: http://localhost:5173
2. Try to sign up a new user
3. Check email for verification code
4. Verify and sign in
5. Test AI chatbot
6. Check AWS Console to verify:
   - User created in Cognito
   - Chat messages logged

## 🔒 Security Checklist

- [ ] Old access keys deleted
- [ ] New access keys created and saved securely
- [ ] MFA enabled on root account
- [ ] MFA enabled on IAM user
- [ ] Passwords changed
- [ ] .env files added to .gitignore
- [ ] Never commit credentials to Git
- [ ] S3 buckets have proper CORS
- [ ] Cognito user pool created
- [ ] Bedrock access enabled

## 📝 Important Notes

1. **Never share credentials** in chat, email, or public forums
2. **Use .gitignore** to prevent committing .env files
3. **Rotate keys regularly** (every 90 days)
4. **Monitor AWS costs** in AWS Cost Explorer
5. **Set up billing alerts** for unexpected charges

## 🆘 If You Need Help

- AWS Support: https://console.aws.amazon.com/support
- AWS Documentation: https://docs.aws.amazon.com
- Cognito Docs: https://docs.aws.amazon.com/cognito/
- Bedrock Docs: https://docs.aws.amazon.com/bedrock/

---

**After completing these steps, your AWS integration will be ready to use!**
