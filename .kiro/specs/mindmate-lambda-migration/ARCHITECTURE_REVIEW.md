# MindMate Lambda Architecture Review

## Current Architecture Analysis

### ✅ What Works
1. **Express Server**: Functional but monolithic
2. **MySQL Database**: Schema exists for users table
3. **Basic Auth**: bcrypt password hashing implemented
4. **Simple Chatbot**: Rule-based responses working
5. **CORS**: Properly configured for localhost

### ❌ Critical Gaps
1. **No AI Integration**: Placeholder responses only
2. **No Voice Processing**: Endpoints return 501
3. **No Dashboard Data**: Missing mood, journal, wellness tables
4. **No Role Management**: Basic role field but no RBAC
5. **No Analytics**: No aggregation or metrics
6. **No Cloud Integration**: Local-only deployment

## Proposed Lambda Architecture

### Service Decomposition
```
┌─────────────────────────────────────────────────────────┐
│                    CloudFront + Amplify                  │
│                     (React Frontend)                     │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                   API Gateway (REST)                     │
│              /auth, /chat, /voice, /dashboard            │
└─┬──────┬──────┬──────┬──────┬──────┬──────┬────────────┘
  │      │      │      │      │      │      │
  ▼      ▼      ▼      ▼      ▼      ▼      ▼
┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐
│Auth│  │Chat│  │Voice│ │TTS│  │Dash│  │Admin│ │Analytics│
│λ  │  │λ  │  │λ   │ │λ │  │λ  │  │λ   │ │λ        │
└─┬─┘  └─┬─┘  └─┬──┘ └─┬┘  └─┬─┘  └─┬──┘  └─┬───────┘
  │      │      │      │      │      │      │
  │      ├──────┴──────┴──────┤      │      │
  │      │                    │      │      │
  ▼      ▼                    ▼      ▼      ▼
┌────────────────────────────────────────────────┐
│         Cognito    Bedrock   Transcribe        │
│         User Pool  Claude    Polly             │
└────────────────────────────────────────────────┘
  │
  ▼
┌────────────────────────────────────────────────┐
│         Aurora MySQL Serverless v2             │
│         (users, sessions, mood, journal)       │
└────────────────────────────────────────────────┘
```

## Lambda Functions Design

### 1. Auth Lambda (`auth-function`)
**Trigger**: API Gateway `/auth/*`
**Purpose**: User authentication via Cognito
**Endpoints**:
- POST /auth/signup
- POST /auth/login
- POST /auth/refresh
- POST /auth/verify

**Dependencies**: Cognito SDK, JWT
**Memory**: 256MB
**Timeout**: 10s

### 2. Chat Lambda (`chat-function`)
**Trigger**: API Gateway `/chat`
**Purpose**: AI conversation via Bedrock
**Endpoints**:
- POST /chat

**Dependencies**: Bedrock SDK, Aurora connection
**Memory**: 512MB
**Timeout**: 30s

### 3. Voice Lambda (`voice-function`)
**Trigger**: API Gateway `/voice`
**Purpose**: Speech-to-text via Transcribe
**Endpoints**:
- POST /voice/transcribe

**Dependencies**: Transcribe SDK, S3 SDK
**Memory**: 512MB
**Timeout**: 60s

### 4. TTS Lambda (`tts-function`)
**Trigger**: API Gateway `/tts`
**Purpose**: Text-to-speech via Polly
**Endpoints**:
- POST /tts/synthesize

**Dependencies**: Polly SDK, S3 SDK
**Memory**: 256MB
**Timeout**: 30s

### 5. Dashboard Lambda (`dashboard-function`)
**Trigger**: API Gateway `/dashboard/*`
**Purpose**: User/Counsellor/Admin dashboards
**Endpoints**:
- GET /dashboard/user/:userId
- GET /dashboard/counsellor/:counsellorId
- GET /dashboard/admin

**Dependencies**: Aurora connection
**Memory**: 512MB
**Timeout**: 15s

### 6. Analytics Lambda (`analytics-function`)
**Trigger**: EventBridge (scheduled)
**Purpose**: Daily aggregations
**Schedule**: Daily at 00:00 UTC

**Dependencies**: Aurora connection, CloudWatch SDK
**Memory**: 1024MB
**Timeout**: 300s (5min)

## Security Architecture

### Authentication Flow
```
1. User → Amplify Auth → Cognito
2. Cognito → JWT Token (ID + Access)
3. Frontend → API Gateway (Authorization: Bearer <token>)
4. API Gateway → Cognito Authorizer (validates JWT)
5. API Gateway → Lambda (with user context)
6. Lambda → Aurora (with user_id from JWT)
```

### IAM Roles
- **Lambda Execution Role**: CloudWatch Logs, VPC access
- **Lambda Function Role**: Bedrock, Transcribe, Polly, S3, Secrets Manager
- **API Gateway Role**: CloudWatch Logs, Lambda invoke
- **Cognito Role**: SES for email verification

### Secrets Management
- Database credentials → AWS Secrets Manager
- API keys → Secrets Manager
- JWT secrets → Secrets Manager (if needed)
- Environment variables → Lambda environment (non-sensitive only)

## Database Schema Enhancements

### Required New Tables
```sql
-- Mood tracking
CREATE TABLE mood_check_ins (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    mood_value INT NOT NULL,
    emotion VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_date (user_id, created_at)
);

-- Journal entries
CREATE TABLE journal_entries (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    entry_text TEXT NOT NULL,
    sentiment VARCHAR(20),
    ai_feedback TEXT,
    entry_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_user_date (user_id, entry_date)
);

-- Wellness activities
CREATE TABLE wellness_activities (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    activity_type VARCHAR(50),
    duration_minutes INT,
    points_earned INT DEFAULT 10,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Chat messages
CREATE TABLE chat_messages (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    message_text TEXT NOT NULL,
    response_text TEXT,
    model_used VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Sessions (counsellor meetings)
CREATE TABLE counsellor_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    counsellor_id VARCHAR(36),
    scheduled_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (counsellor_id) REFERENCES users(id)
);
```

## Validation Results

### ✅ Architecture Improvements
1. **Microservices**: Each Lambda handles one concern
2. **Scalability**: Auto-scales per function
3. **Cost**: Pay only for execution time
4. **Security**: Cognito + API Gateway authorizers
5. **Monitoring**: CloudWatch per-function metrics

### ⚠️ Considerations
1. **Cold Starts**: 1-3s for first invocation
2. **VPC Latency**: Aurora in VPC adds ~100ms
3. **Timeout Limits**: Max 15min per Lambda
4. **Concurrent Limits**: Default 1000 (can increase)
5. **Package Size**: Max 50MB zipped, 250MB unzipped

### 🔧 Recommendations
1. Use Lambda layers for shared dependencies
2. Keep Lambdas warm with EventBridge pings
3. Use RDS Proxy for connection pooling
4. Implement circuit breakers for external APIs
5. Use Step Functions for long-running workflows
