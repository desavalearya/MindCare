# MindMate AWS Lambda Migration - Complete Guide

## Executive Summary

This document provides a complete migration plan for transforming MindMate from a monolithic Express application to a serverless AWS Lambda architecture. The migration includes:

- **6 Lambda functions** for microservices architecture
- **Amazon Cognito** for authentication
- **Amazon Bedrock** (Claude) for AI chat
- **Amazon Transcribe** for voice-to-text
- **Amazon Polly** for text-to-speech
- **Aurora MySQL Serverless v2** for database
- **API Gateway** for REST API management
- **AWS Amplify** for frontend hosting
- **CloudWatch** for monitoring

**Estimated Timeline**: 12-16 weeks
**Estimated Cost**: $200-500/month (low traffic)

## 📦 Installation Commands

### Frontend Dependencies
```bash
npm install @aws-sdk/client-cognito-identity-provider \
  @aws-sdk/client-s3 \
  @aws-sdk/s3-request-presigner \
  @aws-sdk/client-bedrock-runtime \
  @aws-sdk/client-transcribe \
  @aws-sdk/client-polly \
  aws-amplify \
  @aws-amplify/ui-react
```

### Lambda Functions Setup
```bash
mkdir lambda-functions && cd lambda-functions
npm init -y
npm install @aws-sdk/client-cognito-identity-provider \
  @aws-sdk/client-s3 \
  @aws-sdk/client-bedrock-runtime \
  @aws-sdk/client-transcribe \
  @aws-sdk/client-polly \
  @aws-sdk/client-secrets-manager \
  mysql2 \
  jsonwebtoken \
  bcryptjs \
  uuid
```

### Infrastructure Tools
```bash
npm install -g aws-cdk
npm install -g serverless
```

## 🏗️ Complete Task List

### PHASE 1: AWS Account Setup (Week 1)
**Estimated Effort**: 8 hours

- [ ] 1.1 Create AWS Account
  - Sign up for AWS account
  - Enable MFA on root account
  - Create IAM admin user
  - Configure AWS CLI with credentials
  
- [ ] 1.2 Set up AWS Organizations
  - Create development account
  - Create production account
  - Set up billing alerts
  
- [ ] 1.3 Configure AWS Regions
  - Primary: us-east-1
  - Backup: us-west-2
  - Enable required services in both regions

### PHASE 2: Cognito Authentication (Week 2)
**Estimated Effort**: 16 hours

- [ ] 2.1 Create Cognito User Pool
  - Configure email/password sign-in
  - Set password policy (min 8 chars, uppercase, lowercase, numbers)
  - Enable email verification
  - Configure MFA (optional)
  
- [ ] 2.2 Create User Groups
  - Create "user" group
  - Create "counsellor" group
  - Create "admin" group
  - Set group precedence
  
- [ ] 2.3 Configure App Client
  - Create app client for web
  - Enable SRP authentication
  - Configure OAuth flows
  - Set callback URLs
  
- [ ] 2.4 Migrate Existing Users
  - Export users from MySQL
  - Create Lambda trigger for migration
  - Import users to Cognito
  - Test authentication

### PHASE 3: Database Migration (Week 3-4)
**Estimated Effort**: 24 hours

- [ ] 3.1 Create Aurora Serverless v2 Cluster
  - Choose MySQL 8.0 compatible
  - Configure capacity (0.5-2 ACU)
  - Enable Multi-AZ
  - Set backup retention (7 days)
  
- [ ] 3.2 Create Enhanced Schema
  - Create mood_check_ins table
  - Create journal_entries table
  - Create wellness_activities table
  - Create chat_messages table
  - Create counsellor_sessions table
  - Create rewards table
  - Create user_rewards table
  - Add indexes for performance
  
- [ ] 3.3 Migrate Data
  - Export existing users table
  - Import to Aurora
  - Validate data integrity
  - Test connections
  
- [ ] 3.4 Configure Secrets Manager
  - Store database credentials
  - Create rotation policy
  - Test secret retrieval

### PHASE 4: S3 Storage (Week 4)
**Estimated Effort**: 8 hours

- [ ] 4.1 Create S3 Buckets
  - mindmate-audio-uploads (voice files)
  - mindmate-audio-output (TTS files)
  - mindmate-user-content (profile pics, etc)
  
- [ ] 4.2 Configure Bucket Policies
  - Enable encryption at rest
  - Set lifecycle policies (delete after 90 days)
  - Configure CORS for frontend
  - Enable versioning
  
- [ ] 4.3 Set up CloudFront
  - Create distribution for S3
  - Configure SSL certificate
  - Set cache behaviors

### PHASE 5: Lambda Functions Development (Week 5-7)
**Estimated Effort**: 60 hours

- [ ] 5.1 Auth Lambda
  - Implement signup endpoint
  - Implement login endpoint
  - Implement token refresh
  - Implement password reset
  - Add Cognito integration
  - Test with Postman
  
- [ ] 5.2 Chat Lambda
  - Implement Bedrock integration
  - Create prompt templates
  - Add conversation history
  - Store messages in Aurora
  - Implement error handling
  - Test with sample prompts
  
- [ ] 5.3 Voice Lambda
  - Implement S3 upload
  - Integrate Transcribe
  - Poll for job completion
  - Return transcript
  - Store in database
  - Test with audio files
  
- [ ] 5.4 TTS Lambda
  - Integrate Polly
  - Generate audio from text
  - Upload to S3
  - Return pre-signed URL
  - Test with sample text
  
- [ ] 5.5 Dashboard Lambda
  - Implement user dashboard endpoint
  - Implement counsellor dashboard endpoint
  - Implement admin dashboard endpoint
  - Add analytics queries
  - Optimize database queries
  - Test with sample data
  
- [ ] 5.6 Analytics Lambda
  - Create daily aggregation job
  - Calculate user metrics
  - Calculate counsellor metrics
  - Store in analytics table
  - Schedule with EventBridge

### PHASE 6: API Gateway Setup (Week 8)
**Estimated Effort**: 16 hours

- [ ] 6.1 Create REST API
  - Define API structure
  - Create resources (/auth, /chat, /voice, /tts, /dashboard)
  - Configure CORS
  
- [ ] 6.2 Configure Cognito Authorizer
  - Create authorizer
  - Link to user pool
  - Test token validation
  
- [ ] 6.3 Create Lambda Integrations
  - Link auth endpoints to auth-lambda
  - Link chat endpoint to chat-lambda
  - Link voice endpoint to voice-lambda
  - Link tts endpoint to tts-lambda
  - Link dashboard endpoints to dashboard-lambda
  
- [ ] 6.4 Configure Throttling
  - Set rate limits (1000 req/s)
  - Set burst limits (2000 req/s)
  - Configure per-user quotas
  
- [ ] 6.5 Deploy API
  - Create dev stage
  - Create prod stage
  - Test all endpoints

### PHASE 7: Frontend Migration (Week 9-10)
**Estimated Effort**: 32 hours

- [ ] 7.1 Install Amplify
  - Add Amplify dependencies
  - Configure Amplify
  - Set up authentication
  
- [ ] 7.2 Update Authentication
  - Replace local auth with Cognito
  - Implement sign up flow
  - Implement sign in flow
  - Implement password reset
  - Add token refresh logic
  
- [ ] 7.3 Update API Calls
  - Replace axios with Amplify API
  - Add JWT tokens to requests
  - Handle 401 errors
  - Implement retry logic
  
- [ ] 7.4 Update Dashboard Components
  - Fetch data from new endpoints
  - Update state management
  - Add loading states
  - Add error handling
  
- [ ] 7.5 Deploy to Amplify
  - Connect Git repository
  - Configure build settings
  - Set environment variables
  - Deploy to dev environment
  - Test deployment

### PHASE 8: Bedrock AI Integration (Week 11)
**Estimated Effort**: 24 hours

- [ ] 8.1 Enable Bedrock Access
  - Request model access in console
  - Enable Claude 3 Sonnet
  - Test model invocation
  
- [ ] 8.2 Implement Chat Logic
  - Create system prompts
  - Add conversation context
  - Implement streaming (optional)
  - Add error handling
  
- [ ] 8.3 Test AI Responses
  - Test with various prompts
  - Validate response quality
  - Measure latency
  - Optimize prompts

### PHASE 9: Voice Processing (Week 12)
**Estimated Effort**: 20 hours

- [ ] 9.1 Implement Transcribe
  - Upload audio to S3
  - Start transcription job
  - Poll for completion
  - Retrieve transcript
  
- [ ] 9.2 Implement Polly
  - Generate speech from text
  - Store audio in S3
  - Generate pre-signed URL
  - Return to frontend
  
- [ ] 9.3 Test Voice Features
  - Test with various audio formats
  - Test with different voices
  - Measure processing time

### PHASE 10: Monitoring & Logging (Week 13)
**Estimated Effort**: 16 hours

- [ ] 10.1 Configure CloudWatch
  - Create log groups for each Lambda
  - Set retention policies
  - Create custom metrics
  
- [ ] 10.2 Create Dashboards
  - Lambda invocations
  - Error rates
  - Latency metrics
  - Cost tracking
  
- [ ] 10.3 Set up Alarms
  - High error rate alarm
  - High latency alarm
  - Cost threshold alarm
  - Database connection alarm
  
- [ ] 10.4 Enable X-Ray
  - Enable tracing on Lambdas
  - Enable tracing on API Gateway
  - Create service map
  - Analyze traces

### PHASE 11: Security Hardening (Week 14)
**Estimated Effort**: 16 hours

- [ ] 11.1 IAM Review
  - Apply least privilege
  - Remove unused permissions
  - Enable MFA for console access
  
- [ ] 11.2 Encryption
  - Enable encryption at rest (Aurora, S3)
  - Enable encryption in transit (TLS 1.2+)
  - Rotate encryption keys
  
- [ ] 11.3 Security Scanning
  - Run AWS Inspector
  - Scan Lambda dependencies
  - Fix vulnerabilities
  
- [ ] 11.4 Compliance
  - Enable CloudTrail
  - Enable Config
  - Document security controls

### PHASE 12: Testing (Week 15)
**Estimated Effort**: 24 hours

- [ ] 12.1 Unit Tests
  - Test Lambda functions
  - Test API endpoints
  - Test frontend components
  
- [ ] 12.2 Integration Tests
  - Test end-to-end flows
  - Test authentication
  - Test AI chat
  - Test voice processing
  
- [ ] 12.3 Load Tests
  - Test with 100 concurrent users
  - Test with 1000 requests/min
  - Measure response times
  - Identify bottlenecks
  
- [ ] 12.4 Security Tests
  - Test authentication bypass
  - Test SQL injection
  - Test XSS
  - Test CSRF

### PHASE 13: Production Deployment (Week 16)
**Estimated Effort**: 16 hours

- [ ] 13.1 Pre-Deployment
  - Backup current system
  - Create rollback plan
  - Notify users
  
- [ ] 13.2 Deploy Infrastructure
  - Deploy to production account
  - Verify all resources
  - Test connectivity
  
- [ ] 13.3 Migrate Data
  - Export production data
  - Import to Aurora
  - Validate integrity
  
- [ ] 13.4 Deploy Applications
  - Deploy Lambda functions
  - Deploy frontend
  - Update DNS
  
- [ ] 13.5 Post-Deployment
  - Monitor for 24 hours
  - Fix any issues
  - Document lessons learned

### PHASE 14: Cost Optimization (Ongoing)
**Estimated Effort**: 8 hours/month

- [ ] 14.1 Review Costs
  - Analyze AWS Cost Explorer
  - Identify expensive resources
  - Optimize Lambda memory
  - Optimize Aurora capacity
  
- [ ] 14.2 Implement Savings
  - Use Savings Plans
  - Use Reserved Capacity
  - Delete unused resources
  - Optimize S3 storage classes

## 🔒 Security Best Practices

1. **Authentication**: Always use Cognito, never store passwords
2. **Authorization**: Validate JWT tokens on every request
3. **Encryption**: Enable at rest and in transit
4. **Secrets**: Use Secrets Manager, never hardcode
5. **IAM**: Least privilege, separate roles per function
6. **Logging**: Log all access, never log sensitive data
7. **Rate Limiting**: Implement on API Gateway
8. **Input Validation**: Validate all user inputs
9. **CORS**: Restrict to known origins
10. **Monitoring**: Alert on suspicious activity

## 📊 Monitoring Strategy

### CloudWatch Metrics
- Lambda invocations per function
- Lambda errors per function
- Lambda duration (p50, p95, p99)
- API Gateway 4xx/5xx errors
- API Gateway latency
- Aurora connections
- Aurora CPU utilization
- Cognito sign-ins/sign-ups

### Alarms
- **Critical**: Error rate > 5%, Latency > 3s
- **Warning**: Error rate > 1%, Latency > 1s
- **Info**: Cost > $500/month

### Dashboards
- **Operations**: Lambda metrics, API Gateway metrics
- **Business**: User sign-ups, active users, chat messages
- **Cost**: Daily spend by service

## 💰 Cost Estimation

### Monthly Costs (Low Traffic: 1000 users, 10k requests/day)
- **Lambda**: $20-50 (based on invocations)
- **API Gateway**: $10-20
- **Aurora Serverless**: $50-100 (0.5-1 ACU average)
- **Cognito**: $0-5 (first 50k MAU free)
- **Bedrock**: $50-150 (based on tokens)
- **Transcribe**: $10-30 (based on minutes)
- **Polly**: $5-15 (based on characters)
- **S3**: $5-10
- **CloudWatch**: $10-20
- **Data Transfer**: $10-20

**Total**: $170-420/month

### Monthly Costs (High Traffic: 10k users, 100k requests/day)
- **Lambda**: $100-200
- **API Gateway**: $50-100
- **Aurora Serverless**: $200-400 (2-4 ACU average)
- **Cognito**: $25-50
- **Bedrock**: $500-1000
- **Transcribe**: $100-200
- **Polly**: $50-100
- **S3**: $20-40
- **CloudWatch**: $30-50
- **Data Transfer**: $50-100

**Total**: $1,125-2,240/month

## 🚀 Quick Start Commands

### 1. Install Dependencies
```bash
# Frontend
cd frontend && npm install

# Lambda
cd lambda-functions && npm install

# Infrastructure
npm install -g aws-cdk serverless
```

### 2. Configure AWS
```bash
aws configure
# Enter Access Key, Secret Key, Region (us-east-1)
```

### 3. Deploy Infrastructure
```bash
cd infrastructure
cdk bootstrap
cdk deploy --all
```

### 4. Deploy Lambda Functions
```bash
cd lambda-functions
serverless deploy --stage dev
```

### 5. Deploy Frontend
```bash
cd frontend
amplify init
amplify push
amplify publish
```

## 📝 Next Steps

1. Review this guide with your team
2. Set up AWS accounts
3. Install required dependencies
4. Start with Phase 1 (AWS Account Setup)
5. Follow phases sequentially
6. Test thoroughly at each phase
7. Document any deviations
8. Monitor costs closely

## 📞 Support Resources

- AWS Documentation: https://docs.aws.amazon.com
- AWS Support: https://console.aws.amazon.com/support
- Amplify Docs: https://docs.amplify.aws
- Bedrock Docs: https://docs.aws.amazon.com/bedrock
- Community: AWS re:Post, Stack Overflow

---

**Document Version**: 1.0
**Last Updated**: 2024
**Author**: Cloud Architecture Team
**Status**: Ready for Implementation
