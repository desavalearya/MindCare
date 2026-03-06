# TASK 1: Complete Project Summary - MindCare Mental Health Platform

## 🎯 Project Overview

**MindCare** is a comprehensive mental health support platform built with a serverless architecture on AWS. It provides AI-powered mental health support, mood tracking, journaling, voice interactions, and counsellor management.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│                    (React + TypeScript + Vite)                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      AWS AMPLIFY (Hosting)                       │
│                    CloudFront CDN (Distribution)                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION LAYER                          │
│                      Amazon Cognito                              │
│              (User Pools + Identity Pools)                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       API GATEWAY                                │
│                  (REST API + Authorizer)                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      AWS LAMBDA FUNCTIONS                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Auth Handler │  │ Chat Handler │  │Voice Handler │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      AWS SERVICES LAYER                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ Bedrock  │ │Transcribe│ │  Polly   │ │    S3    │          │
│  │ (Claude) │ │(Voice→Text)│(Text→Voice)│ (Storage)│          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│              Aurora MySQL Serverless                             │
│         (11 Tables + 2 Views + Indexes)                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   MONITORING & SECURITY                          │
│  CloudWatch (Logs + Metrics) | Secrets Manager | IAM | KMS     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💻 Tech Stack Breakdown

### **FRONTEND STACK**

#### Core Framework
- **React 18.3.1** - UI library
- **TypeScript 5.8.3** - Type safety
- **Vite 5.4.19** - Build tool & dev server

#### UI Components & Styling
- **Tailwind CSS 3.4.17** - Utility-first CSS
- **Radix UI** - Accessible component primitives
  - 30+ components (Dialog, Dropdown, Tabs, etc.)
- **shadcn/ui** - Pre-built component library
- **Framer Motion 12.23.22** - Animations
- **Lucide React 0.462.0** - Icons

#### State Management & Data Fetching
- **React Context API** - Global state (UserContext)
- **TanStack Query 5.83.0** - Server state management
- **React Hook Form 7.61.1** - Form handling
- **Zod 3.25.76** - Schema validation

#### Routing
- **React Router DOM 6.30.1** - Client-side routing

#### Charts & Visualization
- **Recharts 2.15.4** - Data visualization

#### AWS Integration (Frontend)
- **aws-amplify 6.16.2** - AWS SDK wrapper
- **@aws-amplify/ui-react 6.15.1** - Pre-built UI components
- **@aws-sdk/client-cognito-identity-provider 3.1002.0** - Authentication
- **@aws-sdk/client-s3 3.1002.0** - File storage
- **@aws-sdk/client-bedrock-runtime 3.1002.0** - AI chat
- **@aws-sdk/client-transcribe 3.1002.0** - Voice-to-text
- **@aws-sdk/client-polly 3.1002.0** - Text-to-speech
- **@aws-sdk/client-secrets-manager 3.1002.0** - Secrets retrieval
- **@aws-sdk/client-cloudwatch-logs 3.1002.0** - Logging
- **@aws-sdk/client-cloudwatch 3.1002.0** - Metrics

---

### **BACKEND STACK**

#### Serverless Functions
- **AWS Lambda** - Serverless compute
- **Node.js 20.x** - Runtime environment

#### Lambda Dependencies
- **@aws-sdk/client-cognito-identity-provider** - User management
- **@aws-sdk/client-s3** - File operations
- **@aws-sdk/client-bedrock-runtime** - AI processing
- **@aws-sdk/client-transcribe** - Audio transcription
- **@aws-sdk/client-polly** - Speech synthesis
- **@aws-sdk/client-secrets-manager** - Secrets access
- **@aws-sdk/client-cloudwatch-logs** - Logging
- **mysql2** - Database driver
- **jsonwebtoken** - JWT handling
- **uuid** - Unique ID generation

#### API Layer
- **Amazon API Gateway** - REST API management
- **OpenAPI 3.0** - API specification

#### Database
- **Aurora MySQL Serverless v2** - Relational database
- **MySQL 8.0** - Database engine

---

### **AWS SERVICES STACK**

#### Authentication & Authorization
- **Amazon Cognito User Pools** - User authentication
- **Amazon Cognito Identity Pools** - AWS credentials
- **JWT Tokens** - Session management

#### AI & Machine Learning
- **Amazon Bedrock** - AI foundation models
  - Model: Claude 3 Sonnet (anthropic.claude-3-sonnet-20240229-v1:0)
  - Use: Mental health chatbot, emotion analysis

#### Voice Processing
- **Amazon Transcribe** - Speech-to-text
  - Language: en-US
  - Formats: mp3, wav, mp4, flac, ogg, amr, webm
- **Amazon Polly** - Text-to-speech
  - Engine: Neural
  - Voices: Joanna, Matthew, Salli, Joey, Amy, Brian

#### Storage
- **Amazon S3** - Object storage
  - Bucket 1: mindcare-audio-uploads (voice files)
  - Bucket 2: mindcare-user-content (profile pics, documents)

#### Compute
- **AWS Lambda** - Serverless functions
  - 3 functions: auth-handler, chat-handler, voice-handler
  - Memory: 512MB - 1024MB
  - Timeout: 30s - 300s

#### Networking & Content Delivery
- **Amazon API Gateway** - API management
- **Amazon CloudFront** - CDN
- **AWS Amplify** - Frontend hosting

#### Security
- **AWS IAM** - Identity & access management
- **AWS Secrets Manager** - Secrets storage
- **AWS KMS** - Encryption key management

#### Monitoring & Logging
- **Amazon CloudWatch Logs** - Log aggregation
- **Amazon CloudWatch Metrics** - Performance monitoring
- **AWS X-Ray** - Distributed tracing (optional)

#### Database
- **Aurora MySQL Serverless v2** - Managed database
  - Auto-scaling: 0.5 - 2 ACU
  - Multi-AZ: Enabled
  - Backup: 7 days retention

---

## 📂 Project Structure & Tech Mapping

```
mindcare/
│
├── src/                                    # FRONTEND (React + TypeScript)
│   ├── main.tsx                           # Entry point (Vite)
│   ├── App.tsx                            # Root component (React Router)
│   │
│   ├── lib/                               # AWS SERVICE INTEGRATIONS
│   │   ├── aws-config.ts                  # Amplify configuration
│   │   ├── cognito-auth.ts                # Cognito SDK (Authentication)
│   │   ├── bedrock-chat.ts                # Bedrock SDK (AI Chat)
│   │   ├── transcribe-service.ts          # Transcribe SDK (Voice→Text)
│   │   ├── polly-service.ts               # Polly SDK (Text→Voice)
│   │   ├── s3-service.ts                  # S3 SDK (File Storage)
│   │   ├── secrets-manager-service.ts     # Secrets Manager SDK
│   │   ├── cloudwatch-service.ts          # CloudWatch SDK (Logging)
│   │   └── utils.ts                       # Utility functions
│   │
│   ├── contexts/                          # STATE MANAGEMENT
│   │   └── UserContext.tsx                # User state (React Context)
│   │
│   ├── pages/                             # ROUTE COMPONENTS
│   │   ├── auth/
│   │   │   ├── SignIn.tsx                 # Login page (Cognito)
│   │   │   └── SignUp.tsx                 # Registration page (Cognito)
│   │   └── dashboard/
│   │       ├── user/                      # User dashboard pages
│   │       ├── counsellor/                # Counsellor dashboard pages
│   │       └── admin/                     # Admin dashboard pages
│   │
│   ├── components/                        # UI COMPONENTS
│   │   ├── dashboard/
│   │   │   ├── AIChatbot.tsx              # AI chat UI (Bedrock)
│   │   │   ├── MoodCheckIn.tsx            # Mood tracking
│   │   │   ├── GratitudeJournal.tsx       # Journal entries
│   │   │   ├── VedicChantingSession.tsx   # Audio playback (Polly)
│   │   │   └── ...                        # Other dashboard components
│   │   └── ui/                            # shadcn/ui components (Radix UI)
│   │
│   └── hooks/                             # CUSTOM HOOKS
│       └── use-toast.ts                   # Toast notifications
│
├── lambda-functions/                      # BACKEND (AWS Lambda)
│   ├── auth-handler.js                    # Authentication Lambda
│   │   # Tech: Node.js 20.x, Cognito SDK, JWT
│   │   # Functions: validate token, get user, update user, delete user
│   │
│   ├── chat-handler.js                    # AI Chat Lambda
│   │   # Tech: Node.js 20.x, Bedrock SDK, MySQL2
│   │   # Functions: send message, get history, clear history
│   │
│   ├── voice-handler.js                   # Voice Processing Lambda
│   │   # Tech: Node.js 20.x, Transcribe SDK, Polly SDK, S3 SDK
│   │   # Functions: transcribe audio, synthesize speech
│   │
│   └── package.json                       # Lambda dependencies
│
├── aws-infrastructure/                    # INFRASTRUCTURE AS CODE
│   ├── api-gateway-config.json            # API Gateway (OpenAPI 3.0)
│   ├── iam-policies.json                  # IAM roles & policies
│   └── cloudfront-config.json             # CloudFront CDN config
│
├── server/                                # DATABASE
│   └── db/
│       └── migrations.sql                 # MySQL schema (Aurora)
│
├── .env                                   # ENVIRONMENT VARIABLES
└── package.json                           # Frontend dependencies
```

---

## 🔄 Complete Workflow - User Journey

### **1. USER REGISTRATION FLOW**

```
User fills signup form
    ↓
Frontend: SignUp.tsx (React Hook Form + Zod validation)
    ↓
Frontend: cognito-auth.ts → signUp()
    ↓
AWS Cognito: Create user account
    ↓
AWS Cognito: Send verification email
    ↓
User clicks verification link
    ↓
AWS Cognito: Verify email
    ↓
Frontend: Redirect to login
```

**Tech Used:**
- React Hook Form (form handling)
- Zod (validation)
- AWS SDK Cognito (signUp, confirmSignUp)
- Cognito User Pool (user storage)

---

### **2. USER LOGIN FLOW**

```
User enters email + password
    ↓
Frontend: SignIn.tsx
    ↓
Frontend: cognito-auth.ts → signIn()
    ↓
AWS Cognito: Validate credentials
    ↓
AWS Cognito: Return JWT tokens (ID token, Access token, Refresh token)
    ↓
Frontend: Store tokens in memory
    ↓
Frontend: UserContext updates user state
    ↓
Frontend: Redirect to dashboard
```

**Tech Used:**
- React Context API (state management)
- AWS SDK Cognito (signIn)
- JWT (token-based auth)
- React Router (navigation)

---

### **3. AI CHATBOT INTERACTION FLOW**

```
User types message in chat
    ↓
Frontend: AIChatbot.tsx
    ↓
Frontend: bedrock-chat.ts → sendMessage()
    ↓
API Gateway: POST /chat/send (with JWT token)
    ↓
API Gateway: Validate JWT with Cognito Authorizer
    ↓
Lambda: chat-handler.js → sendMessage()
    ↓
Lambda: Prepare conversation context
    ↓
Amazon Bedrock: Invoke Claude 3 Sonnet model
    ↓
Bedrock: Generate AI response
    ↓
Lambda: Save message + response to Aurora MySQL
    ↓
Lambda: Return response to frontend
    ↓
Frontend: Display AI message in chat UI
```

**Tech Used:**
- React (UI)
- TanStack Query (data fetching)
- API Gateway (routing)
- Lambda (compute)
- Bedrock Claude 3 Sonnet (AI)
- Aurora MySQL (storage)

---

### **4. VOICE MESSAGE FLOW (Speech-to-Text)**

```
User records voice message
    ↓
Frontend: Voice recording component
    ↓
Frontend: s3-service.ts → uploadAudioFile()
    ↓
Amazon S3: Store audio file (mindcare-audio-uploads bucket)
    ↓
Frontend: transcribe-service.ts → startTranscription()
    ↓
API Gateway: POST /voice/transcribe
    ↓
Lambda: voice-handler.js → startTranscription()
    ↓
Amazon Transcribe: Start transcription job
    ↓
Frontend: Poll for job status (every 2 seconds)
    ↓
API Gateway: GET /voice/transcribe/status
    ↓
Lambda: voice-handler.js → getTranscriptionStatus()
    ↓
Amazon Transcribe: Return transcript when complete
    ↓
Lambda: Parse transcript JSON
    ↓
Frontend: Display transcribed text
```

**Tech Used:**
- Web Audio API (recording)
- AWS SDK S3 (file upload)
- AWS SDK Transcribe (transcription)
- Lambda (orchestration)
- Polling mechanism (status check)

---

### **5. TEXT-TO-SPEECH FLOW**

```
User clicks "Listen" on AI response
    ↓
Frontend: polly-service.ts → synthesizeSpeech()
    ↓
API Gateway: POST /voice/synthesize
    ↓
Lambda: voice-handler.js → synthesizeSpeech()
    ↓
Amazon Polly: Generate audio from text (Neural voice)
    ↓
Lambda: Upload audio to S3 (mindcare-audio-uploads)
    ↓
Lambda: Generate pre-signed URL (expires in 1 hour)
    ↓
Frontend: Play audio using HTML5 Audio API
```

**Tech Used:**
- AWS SDK Polly (speech synthesis)
- AWS SDK S3 (audio storage)
- Pre-signed URLs (secure access)
- HTML5 Audio API (playback)

---

### **6. MOOD CHECK-IN FLOW**

```
User selects mood + adds note
    ↓
Frontend: MoodCheckIn.tsx
    ↓
API Gateway: POST /dashboard/mood-checkin
    ↓
Lambda: dashboard-handler.js (not created yet, direct DB for now)
    ↓
Aurora MySQL: INSERT into mood_check_ins table
    ↓
Aurora MySQL: UPDATE user_points (add 10 points)
    ↓
Aurora MySQL: UPDATE daily_analytics
    ↓
Frontend: Show success message
    ↓
Frontend: Refresh dashboard data
```

**Tech Used:**
- React (form UI)
- MySQL2 (database driver)
- Aurora MySQL (database)
- Transactions (data consistency)

---

### **7. DASHBOARD DATA LOADING FLOW**

```
User navigates to dashboard
    ↓
Frontend: UserDashboard.tsx
    ↓
API Gateway: GET /dashboard/user?userId=123
    ↓
Lambda: dashboard-handler.js
    ↓
Aurora MySQL: Query user_dashboard_summary view
    ↓
MySQL View: Aggregates data from multiple tables:
    - mood_check_ins (recent moods)
    - journal_entries (recent entries)
    - wellness_activities (activity count)
    - user_points (points + streak)
    - chat_messages (message count)
    ↓
Lambda: Return aggregated data
    ↓
Frontend: Render dashboard components
    ↓
Recharts: Visualize mood trends
```

**Tech Used:**
- React (UI)
- TanStack Query (caching)
- MySQL Views (optimized queries)
- Recharts (data visualization)

---

### **8. FILE UPLOAD FLOW (Profile Picture)**

```
User selects profile picture
    ↓
Frontend: File input component
    ↓
Frontend: s3-service.ts → uploadFile()
    ↓
AWS SDK S3: Generate pre-signed POST URL
    ↓
Frontend: Upload file directly to S3 (no Lambda)
    ↓
Amazon S3: Store file (mindcare-user-content bucket)
    ↓
Frontend: Get file URL
    ↓
API Gateway: PUT /auth/user (update profile picture URL)
    ↓
Lambda: auth-handler.js → updateUserAttributes()
    ↓
AWS Cognito: Update custom:profile_picture attribute
    ↓
Frontend: Display new profile picture
```

**Tech Used:**
- AWS SDK S3 (pre-signed URLs)
- Direct S3 upload (no Lambda)
- Cognito custom attributes

---

### **9. LOGGING & MONITORING FLOW**

```
Any user action occurs
    ↓
Frontend: cloudwatch-service.ts → logInfo()
    ↓
AWS SDK CloudWatch Logs: Send log event
    ↓
CloudWatch: Store in /mindcare/application log group
    ↓
Lambda: Automatic CloudWatch integration
    ↓
CloudWatch: Capture Lambda logs, errors, metrics
    ↓
CloudWatch Dashboards: Visualize metrics
    ↓
CloudWatch Alarms: Alert on errors/high latency
```

**Tech Used:**
- AWS SDK CloudWatch Logs
- CloudWatch Metrics
- CloudWatch Dashboards
- CloudWatch Alarms

---

### **10. SECRETS MANAGEMENT FLOW**

```
Lambda function needs database credentials
    ↓
Lambda: secrets-manager-service.ts → getSecret()
    ↓
AWS Secrets Manager: Retrieve secret
    ↓
Secrets Manager: Decrypt using KMS
    ↓
Lambda: Parse JSON secret
    ↓
Lambda: Connect to Aurora MySQL
```

**Tech Used:**
- AWS Secrets Manager
- AWS KMS (encryption)
- Automatic secret rotation (optional)

---

## 🗄️ Database Schema & Tech

### **Aurora MySQL Serverless v2**

**Configuration:**
- Engine: MySQL 8.0
- Capacity: 0.5 - 2 ACU (auto-scaling)
- Multi-AZ: Enabled
- Backup: 7 days retention
- Encryption: Enabled (KMS)

### **Tables (11)**

1. **users** (managed by Cognito, minimal local storage)
2. **mood_check_ins** - Daily mood tracking
3. **journal_entries** - Reflection journal with AI feedback
4. **wellness_activities** - Activity logging (meditation, exercise, etc.)
5. **chat_messages** - AI conversation history
6. **counsellor_sessions** - Session scheduling and notes
7. **rewards** - Available rewards/badges
8. **user_rewards** - Earned rewards
9. **user_points** - Points and streak tracking
10. **counsellor_groups** - Group therapy management
11. **group_members** - Group membership
12. **daily_analytics** - Aggregated metrics

### **Views (2)**

1. **user_dashboard_summary** - Optimized user dashboard query
2. **counsellor_dashboard_summary** - Optimized counsellor dashboard query

---

## 🔐 Security Architecture

### **Authentication Flow**
```
User → Cognito User Pool → JWT Token → API Gateway Authorizer → Lambda
```

### **Authorization Levels**
- **User**: Access own data only
- **Counsellor**: Access assigned patients
- **Admin**: Access all data

### **Data Encryption**
- **At Rest**: KMS encryption (S3, Aurora, Secrets Manager)
- **In Transit**: TLS 1.2+ (all API calls)

### **Secrets Management**
- Database credentials → Secrets Manager
- API keys → Secrets Manager
- AWS credentials → IAM roles (no hardcoded keys)

---

## 📊 Performance Optimization

### **Frontend**
- **Code Splitting**: React.lazy() for route-based splitting
- **Caching**: TanStack Query (5-minute cache)
- **CDN**: CloudFront for static assets
- **Image Optimization**: WebP format, lazy loading

### **Backend**
- **Lambda Cold Start**: Keep functions warm with CloudWatch Events
- **Database**: Connection pooling (mysql2)
- **API Gateway**: Response caching (5 minutes)
- **S3**: Pre-signed URLs (direct upload/download)

### **Database**
- **Indexes**: On user_id, created_at columns
- **Views**: Pre-aggregated dashboard data
- **Connection Pooling**: Reuse connections across Lambda invocations

---

## 💰 Cost Breakdown (Estimated)

### **Development (Testing)**
- Cognito: Free (50k MAU)
- Lambda: Free tier (1M requests)
- API Gateway: Free tier (1M requests)
- S3: ~$1-5/month
- Bedrock: ~$10-20/month
- Transcribe: ~$5-10/month
- Polly: ~$2-5/month
- Aurora: ~$50-100/month
- CloudWatch: ~$5-10/month
- **Total: ~$73-150/month**

### **Production (1,000 users)**
- Cognito: Free
- Lambda: ~$20-40/month
- API Gateway: ~$10-20/month
- S3: ~$10-20/month
- Bedrock: ~$50-100/month
- Transcribe: ~$20-40/month
- Polly: ~$10-20/month
- Aurora: ~$100-200/month
- CloudWatch: ~$20-30/month
- CloudFront: ~$20-40/month
- **Total: ~$260-510/month**

---

## 🚀 Deployment Architecture

### **Frontend Deployment**
```
GitHub → AWS Amplify → Build → CloudFront → Users
```

### **Backend Deployment**
```
Local → Zip Lambda functions → Upload to Lambda → API Gateway → Live
```

### **Database Deployment**
```
migrations.sql → MySQL Client → Aurora MySQL → Tables created
```

---

## 📈 Scalability

### **Auto-Scaling Components**
- **Lambda**: Automatic (up to 1000 concurrent executions)
- **Aurora**: Auto-scaling (0.5 - 16 ACU)
- **API Gateway**: Automatic (10,000 requests/second)
- **CloudFront**: Global CDN (unlimited)

### **Bottlenecks to Monitor**
- Bedrock API rate limits (tokens per minute)
- Transcribe concurrent jobs (default: 100)
- Aurora connections (max: 16,000)

---

## 🎯 Key Features & Tech Mapping

| Feature | Frontend Tech | Backend Tech | AWS Service |
|---------|--------------|--------------|-------------|
| User Registration | React Hook Form, Zod | - | Cognito |
| User Login | React Context | JWT | Cognito |
| AI Chatbot | React, TanStack Query | Lambda, MySQL2 | Bedrock, Aurora |
| Voice Recording | Web Audio API | - | S3 |
| Voice Transcription | Polling | Lambda | Transcribe |
| Text-to-Speech | HTML5 Audio | Lambda | Polly |
| Mood Tracking | React, Recharts | Lambda, MySQL2 | Aurora |
| Journal Entries | React, Textarea | Lambda, MySQL2 | Aurora |
| File Upload | S3 SDK | Pre-signed URLs | S3 |
| Dashboard | React, Recharts | MySQL Views | Aurora |
| Logging | CloudWatch SDK | Lambda logs | CloudWatch |
| Monitoring | - | CloudWatch Metrics | CloudWatch |

---

## 🔧 Development Tools

### **Frontend Development**
- **Vite**: Fast dev server with HMR
- **ESLint**: Code linting
- **TypeScript**: Type checking
- **Tailwind CSS**: Utility-first styling

### **Backend Development**
- **Node.js 20.x**: Lambda runtime
- **AWS SAM**: Local Lambda testing (optional)
- **Postman**: API testing

### **Database Development**
- **MySQL Workbench**: Database management
- **DBeaver**: SQL client

### **Infrastructure**
- **AWS Console**: Resource management
- **AWS CLI**: Command-line interface
- **CloudFormation**: Infrastructure as code (optional)

---

## 📝 Summary

**MindCare** is a modern, serverless mental health platform that leverages:

1. **React + TypeScript** for a type-safe, component-based frontend
2. **AWS Amplify** for seamless AWS integration and hosting
3. **AWS Lambda** for scalable, serverless backend
4. **Amazon Bedrock (Claude)** for intelligent AI conversations
5. **Amazon Transcribe & Polly** for voice interactions
6. **Aurora MySQL Serverless** for flexible, auto-scaling database
7. **Amazon Cognito** for secure authentication
8. **CloudWatch** for comprehensive monitoring

The architecture is designed for:
- **Scalability**: Auto-scaling at every layer
- **Security**: End-to-end encryption, JWT auth, IAM roles
- **Performance**: CDN, caching, optimized queries
- **Cost-Efficiency**: Pay-per-use serverless model
- **Maintainability**: Modular, well-documented codebase

---

**Total Lines of Code**: ~4,500+
**Total AWS Services**: 14
**Total Files**: 100+
**Development Time**: 60-80 hours
**Setup Time**: 2-4 hours
