# 🧠 MindCare - AI-Powered Mental Health Platform

[![AWS](https://img.shields.io/badge/AWS-Serverless-orange)](https://aws.amazon.com)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

> An intelligent mental health support platform powered by AWS serverless architecture, featuring AI chatbot (Claude 3), voice interactions, mood tracking, and comprehensive wellness tools.

---

## 🎯 Overview

**MindCare** is a comprehensive mental health support platform that combines AI-powered conversations, voice interactions, mood tracking, and wellness activities. Built on AWS serverless architecture for scalability, security, and cost-efficiency.

### Key Highlights

- 🤖 **AI Chatbot** powered by Amazon Bedrock (Claude 3 Sonnet)
- 🎙️ **Voice Interactions** with Amazon Transcribe & Polly
- 📊 **Mood Tracking** with analytics and insights
- 📝 **Gratitude Journal** with AI feedback
- 🧘 **Wellness Activities** (meditation, breathing exercises)
- 👥 **Multi-Role Support** (Users, Counsellors, Admins)
- 🔒 **Secure Authentication** with Amazon Cognito
- ☁️ **Serverless Architecture** for auto-scaling

---

## 🚀 Quick Start

```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/mindcare.git
cd mindcare

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your AWS credentials

# 4. Run development server
npm run dev

# 5. Open browser
# http://localhost:5173
```

**📖 For complete setup, see [START_HERE.md](START_HERE.md)**

---

## ✨ Features

### For Users
- AI-powered mental health chatbot
- Voice message recording and transcription
- Daily mood check-ins with trend analysis
- Gratitude journaling with AI insights
- Wellness activity tracking
- Counsellor recommendations
- Points and rewards system

### For Counsellors
- Patient dashboard with mood analytics
- Session scheduling and notes
- Group therapy management
- AI-generated insights

### For Admins
- User and counsellor management
- Platform analytics
- System monitoring

---

## 🛠️ Tech Stack

### Frontend
- React 18.3 + TypeScript 5.8
- Vite 5.4 + Tailwind CSS 3.4
- shadcn/ui + Framer Motion
- TanStack Query + React Router

### Backend (Serverless)
- AWS Lambda (Node.js 20.x)
- Amazon API Gateway
- Aurora MySQL Serverless v2

### AWS Services (14 Total)
- Amazon Cognito - Authentication
- Amazon Bedrock - AI (Claude 3)
- Amazon Transcribe - Speech-to-text
- Amazon Polly - Text-to-speech
- Amazon S3 - File storage
- AWS Amplify - Hosting
- Amazon CloudWatch - Monitoring
- And 7 more...

---

## 📚 Documentation

### Complete Guides (90+ pages)

1. **[START_HERE.md](START_HERE.md)** - Your starting point
2. **[TASK1_PROJECT_SUMMARY.md](TASK1_PROJECT_SUMMARY.md)** - Architecture (25+ pages)
3. **[TASK2_DETAILED_AWS_SETUP_GUIDE.md](TASK2_DETAILED_AWS_SETUP_GUIDE.md)** - AWS setup (30+ pages)
4. **[TASK3_REQUIRED_KEYS_AND_IDS.md](TASK3_REQUIRED_KEYS_AND_IDS.md)** - Required keys (15+ pages)
5. **[TASK4_JSON_FORMATS_FOR_AWS_SERVICES.md](TASK4_JSON_FORMATS_FOR_AWS_SERVICES.md)** - JSON configs (20+ pages)

---

## ☁️ AWS Setup

### Prerequisites
- AWS Account with billing enabled
- 2-4 hours for setup
- MySQL client

### Setup Steps
1. Create Cognito User Pool
2. Create S3 Buckets (2)
3. Deploy Lambda Functions (3)
4. Create API Gateway
5. Set up Aurora MySQL
6. Enable Bedrock model access

**📖 See [TASK2_DETAILED_AWS_SETUP_GUIDE.md](TASK2_DETAILED_AWS_SETUP_GUIDE.md) for detailed instructions**

---

## 📁 Project Structure

```
mindcare/
├── src/                    # Frontend (React + TypeScript)
│   ├── lib/                # AWS service integrations
│   ├── components/         # React components
│   └── pages/              # Route pages
├── lambda-functions/       # AWS Lambda functions
│   ├── auth-handler.js     # Authentication
│   ├── chat-handler.js     # AI chat
│   └── voice-handler.js    # Voice processing
├── aws-infrastructure/     # Infrastructure configs
├── server/db/              # Database schema
└── docs/                   # Documentation (90+ pages)
```

---

## 💰 Cost Estimates

- **Development**: ~$20-50/month
- **Production (1K users)**: ~$190-380/month
- **Production (10K users)**: ~$1,125-2,240/month

---

## 🔒 Security

- ✅ JWT authentication with Cognito
- ✅ Encryption at rest (KMS)
- ✅ Encryption in transit (TLS 1.2+)
- ✅ IAM roles with least privilege
- ✅ CloudWatch audit logs

**⚠️ Never commit `.env` files!**

---

## 🚀 Deployment

```bash
# Deploy to AWS Amplify
amplify init
amplify add hosting
amplify publish
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

## 📞 Support

- **Documentation**: [START_HERE.md](START_HERE.md)
- **AWS Setup**: [TASK2_DETAILED_AWS_SETUP_GUIDE.md](TASK2_DETAILED_AWS_SETUP_GUIDE.md)
- **Security**: [GITHUB_PUSH_CHECKLIST.md](GITHUB_PUSH_CHECKLIST.md)

---

## 📊 Stats

- **Lines of Code**: 4,500+
- **AWS Services**: 14
- **Lambda Functions**: 3
- **Database Tables**: 11
- **Documentation**: 90+ pages
- **Setup Time**: 4-6 hours

---

**Built with ❤️ using AWS Serverless Architecture**

**Ready to deploy? Start with [START_HERE.md](START_HERE.md)!** 🚀
