# 🚀 How to Run MindCare Project

## Quick Start (Easiest Way)

Just double-click `start.bat` - it will start both servers automatically!

## Manual Start (Alternative)

### Option 1: Run Both Servers Separately

**Terminal 1 - Backend:**
```bash
cd server
node index.js
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Option 2: Use NPM Scripts

**Backend:**
```bash
npm run server:start
```

**Frontend:**
```bash
npm run dev
```

## Access the Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8083
- **Health Check**: http://localhost:8083/health
- **AWS Services Check**: http://localhost:8083/health/aws

## Prerequisites Checklist

✅ Node.js installed
✅ AWS credentials configured in `.env` and `server/.env`
✅ MySQL database running (if using local DB)
✅ AWS services created:
   - Cognito User Pool
   - S3 Buckets (mindcare-audio-uploads, mindcare-user-content)
   - API Gateway (optional for Lambda)

## Database Setup (First Time Only)

If you haven't set up the database yet:

```bash
mysql -u root -p < server/db/migrations.sql
```

This creates all 22 tables needed for MindCare.

## Troubleshooting

**Backend won't start?**
- Check `server/.env` has your AWS credentials
- Make sure port 8083 is not in use

**Frontend won't start?**
- Check `.env` has your AWS credentials
- Make sure port 8080 is not in use

**AWS services failing?**
- Visit http://localhost:8083/health/aws to see which service is failing
- Verify your AWS credentials have the right permissions
- Check that S3 buckets exist in us-east-1 region

## Custom Domain

Once your domain `mindcare.com` is activated in AWS Amplify:
1. Update `.env`: `VITE_CLOUDFRONT_DOMAIN=mindcare.com`
2. Update Cognito callback URLs to include https://mindcare.com
3. Rebuild and deploy: `npm run build`
