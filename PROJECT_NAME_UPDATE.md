# Project Name Update: MindMate → MindCare

## ✅ Files Updated

All references to "MindMate" have been changed to "MindCare" in the following files:

### Configuration Files
- ✅ `.env` - Frontend environment variables
- ✅ `server/.env` - Backend environment variables  
- ✅ `server/.env.example` - Backend environment template

### Source Code
- ✅ `src/lib/aws-config.ts` - AWS configuration (API name, S3 buckets)
- ✅ `src/lib/bedrock-chat.ts` - AI system prompt

### Database
- ✅ `server/db/migrations.sql` - Database schema comments

### Documentation
- ✅ `SECURE_SETUP_GUIDE.md` - Complete setup guide
  - User pool name: mindcare-users
  - App client name: mindcare-web
  - S3 buckets: mindcare-audio-uploads, mindcare-user-content
  - Database name: mindcare

## 📝 Key Changes

### S3 Bucket Names
- Old: `mindmate-audio-uploads`, `mindmate-user-content`
- New: `mindcare-audio-uploads`, `mindcare-user-content`

### Cognito Resources
- Old: `mindmate-users`, `mindmate-web`
- New: `mindcare-users`, `mindcare-web`

### Database Name
- Old: `mindmate`
- New: `mindcare`

### API Name
- Old: `MindMateAPI`
- New: `MindCareAPI`

### AI System Prompt
- Updated to reference "MindCare" as the application name

## 🎯 What You Need to Do

When following the setup guide, use these names:

1. **Cognito User Pool**: `mindcare-users`
2. **Cognito App Client**: `mindcare-web`
3. **S3 Buckets**: 
   - `mindcare-audio-uploads-495124020251`
   - `mindcare-user-content-495124020251`
4. **Database**: `mindcare`

## 📚 Updated Documentation

All setup instructions in `SECURE_SETUP_GUIDE.md` now use "MindCare" naming convention.

---

**Status**: All files updated ✅  
**Project Name**: MindCare  
**Ready for AWS Setup**: Yes
