# Implementation Plan: AWS Cloud Migration

## Overview

This implementation plan breaks down the migration of the MindCare Digital Mental Health Support Platform from local hosting to AWS cloud-native architecture into actionable coding tasks. The migration follows a phased approach across 14 weeks, covering infrastructure setup, application containerization, frontend migration, database migration, AI services migration, authentication migration, and production cutover.

The tasks are organized by migration phases and focus exclusively on implementation activities that can be performed by a coding agent. Each task references specific requirements from the requirements document and builds incrementally on previous work.

## Tasks

### Phase 1: Infrastructure Setup (Weeks 1-2)

- [ ] 1. Create VPC and network infrastructure using Infrastructure as Code
  - [ ] 1.1 Create Terraform/CloudFormation template for VPC with CIDR 10.0.0.0/16
    - Define VPC resource with DNS support enabled
    - Create Internet Gateway and attach to VPC
    - Tag all resources with Project=MindCare, Environment, ManagedBy
    - _Requirements: 11.2, 16.6_
  
  - [ ] 1.2 Create public subnets across 3 availability zones
    - Define subnets: 10.0.1.0/24, 10.0.2.0/24, 10.0.3.0/24
    - Enable auto-assign public IP for public subnets
    - Create route table with Internet Gateway route
    - _Requirements: 11.2_
  
  - [ ] 1.3 Create private subnets for compute and data layers
    - Define compute subnets: 10.0.11.0/24, 10.0.12.0/24, 10.0.13.0/24
    - Define data subnets: 10.0.21.0/24, 10.0.22.0/24, 10.0.23.0/24
    - Create NAT Gateways in each public subnet
    - Create route tables with NAT Gateway routes for private subnets
    - _Requirements: 11.2_


  - [ ] 1.4 Create security groups for ALB, ECS, and Aurora
    - Create ALB security group: inbound 443 from API Gateway, outbound to ECS
    - Create ECS security group: inbound from ALB on container ports, outbound to Aurora and VPC endpoints
    - Create Aurora security group: inbound 3306 from ECS only
    - _Requirements: 11.2, 12.2_
  
  - [ ]* 1.5 Write property test for VPC network isolation
    - **Property 21: API Gateway Rate Limiting** (infrastructure validation)
    - **Validates: Requirements 17.4**

- [ ] 2. Create IAM roles and policies with least-privilege access
  - [ ] 2.1 Create ECS Task Execution Role
    - Define IAM role with trust policy for ecs-tasks.amazonaws.com
    - Attach policies for ECR pull, CloudWatch logs, Secrets Manager read
    - Scope Secrets Manager access to mindcare/* prefix only
    - _Requirements: 12.1, 12.2_
  
  - [ ] 2.2 Create ECS Task Role for application permissions
    - Define IAM role for application runtime permissions
    - Attach policies for Bedrock, Transcribe, Polly, Comprehend access
    - Attach policies for S3 access to mindcare-* buckets only
    - Attach policies for X-Ray tracing
    - _Requirements: 12.1, 12.2_
  
  - [ ] 2.3 Create CI/CD pipeline IAM role
    - Define IAM role for CodePipeline and CodeBuild
    - Attach policies for ECR push, ECS service updates
    - Attach policy for IAM PassRole to ECS roles only
    - _Requirements: 12.1_
  
  - [ ]* 2.4 Write property test for IAM least-privilege validation
    - **Property 20: Resource Cost Allocation Tagging**
    - **Validates: Requirements 16.6**

- [ ] 3. Set up Secrets Manager and KMS encryption
  - [ ] 3.1 Create KMS encryption key for secrets and data
    - Define KMS key with key policy allowing RDS and S3 services
    - Create key alias: alias/mindcare-encryption
    - Enable automatic key rotation
    - _Requirements: 3.6, 9.1_
  
  - [ ] 3.2 Create Secrets Manager secrets structure
    - Create secret: mindcare/db/credentials with rotation enabled
    - Create secret: mindcare/api/keys for third-party APIs (if any)
    - Create secret: mindcare/jwt/secret for legacy migration period
    - Set rotation schedule to 90 days for database credentials
    - _Requirements: 9.1, 9.4_
  
  - [ ]* 3.3 Write property test for secrets migration completeness
    - **Property 12: Secrets Migration Completeness**
    - **Validates: Requirements 9.3**


- [ ] 4. Create ECR repositories and configure vulnerability scanning
  - [ ] 4.1 Create ECR repository for Express backend
    - Create repository: mindcare-express
    - Enable image scanning on push
    - Set lifecycle policy: keep last 10 images, delete untagged after 7 days
    - _Requirements: 10.4_
  
  - [ ] 4.2 Create ECR repository for FastAPI AI service
    - Create repository: mindcare-fastapi
    - Enable image scanning on push
    - Set lifecycle policy: keep last 10 images, delete untagged after 7 days
    - _Requirements: 10.4_

- [ ] 5. Set up CloudWatch logging and monitoring infrastructure
  - [ ] 5.1 Create CloudWatch log groups for all services
    - Create log group: /ecs/mindcare-express with 30-day retention
    - Create log group: /ecs/mindcare-fastapi with 30-day retention
    - Create log group: /aws/apigateway/mindcare-api with 30-day retention
    - Create log group: /aws/lambda/cognito-migration with 14-day retention
    - _Requirements: 13.1, 13.4_
  
  - [ ] 5.2 Create CloudWatch alarms for critical metrics
    - Create alarm: HighAPIErrorRate (5XXError > 10 for 2 periods)
    - Create alarm: HighDatabaseConnections (connections > 800 for 2 periods)
    - Create alarm: ECSServiceUnhealthy (HealthyHostCount < 1 for 2 periods)
    - Configure SNS topic for alarm notifications
    - _Requirements: 13.3_
  
  - [ ]* 5.3 Write property test for CloudWatch alerting
    - **Property 16: CloudWatch Alerting on Error Threshold**
    - **Validates: Requirements 13.3**

- [ ] 6. Create Aurora Serverless v2 database cluster
  - [ ] 6.1 Create Aurora MySQL Serverless v2 cluster
    - Define cluster with engine: aurora-mysql, version: 8.0.mysql_aurora.3.04.0
    - Configure capacity: 0.5 ACU min, 16 ACU max
    - Enable Multi-AZ with 3 availability zones
    - Enable encryption with KMS key
    - Set backup retention to 7 days
    - _Requirements: 3.1, 3.2, 3.4, 3.6_
  
  - [ ] 6.2 Configure Aurora parameter group
    - Create custom parameter group for Aurora MySQL 8.0
    - Set max_connections=1000, slow_query_log=1, long_query_time=2
    - Set character_set_server=utf8mb4, collation_server=utf8mb4_unicode_ci
    - _Requirements: 3.1_
  
  - [ ] 6.3 Store Aurora credentials in Secrets Manager
    - Generate secure random password for admin user
    - Store connection details in mindcare/db/credentials secret
    - Include host, port, username, password, dbname in secret JSON
    - _Requirements: 2.5, 9.1_
  
  - [ ]* 6.4 Write property test for Aurora auto-scaling
    - **Property 2: Aurora Auto-Scaling Under Load**
    - **Validates: Requirements 3.2**

- [ ] 7. Checkpoint - Validate infrastructure provisioning
  - Ensure all infrastructure resources created successfully, run Terraform/CloudFormation validation, verify security groups follow least-privilege, test Secrets Manager access from local environment, ask the user if questions arise.


### Phase 2: Application Containerization (Weeks 3-4)

- [ ] 8. Create Dockerfile for Express backend with multi-stage build
  - [ ] 8.1 Create Dockerfile.express with builder and runtime stages
    - Use node:18-alpine as base image
    - Create builder stage: copy package files, run npm ci --only=production
    - Create runtime stage: copy node_modules and application code
    - Expose port 3000, add HEALTHCHECK command
    - _Requirements: 10.1, 10.3, 10.5_
  
  - [ ] 8.2 Create health check endpoint for Express backend
    - Implement GET /health endpoint returning 200 with uptime and dependencies status
    - Check database connectivity in health check
    - Return JSON: {status: "healthy", uptime: seconds, database: "connected"}
    - _Requirements: 10.6_
  
  - [ ]* 8.3 Write property test for container health check responsiveness
    - **Property 14: Container Health Check Responsiveness**
    - **Validates: Requirements 10.6**

- [ ] 9. Create Dockerfile for FastAPI AI service with multi-stage build
  - [ ] 9.1 Create Dockerfile.fastapi with builder and runtime stages
    - Use python:3.11-slim as base image
    - Create builder stage: copy requirements.txt, run pip install
    - Create runtime stage: copy site-packages and application code
    - Expose port 8000, add HEALTHCHECK command
    - _Requirements: 10.2, 10.3, 10.5_
  
  - [ ] 9.2 Create health check endpoint for FastAPI service
    - Implement GET /health endpoint returning 200 with service status
    - Check AWS service connectivity (Bedrock, Transcribe, Polly, Comprehend)
    - Return JSON: {status: "healthy", services: {bedrock: "ok", transcribe: "ok", ...}}
    - _Requirements: 10.6_

- [ ] 10. Update Express backend to use AWS Secrets Manager
  - [ ] 10.1 Install AWS SDK and implement secrets retrieval
    - Add aws-sdk dependency to package.json
    - Create secrets.js module with getSecret() function using SecretsManager client
    - Implement LRU cache for secrets to reduce API calls
    - _Requirements: 2.5, 9.2_
  
  - [ ] 10.2 Update database connection to use Secrets Manager credentials
    - Modify database.js to call getSecret('mindcare/db/credentials')
    - Parse secret JSON and extract host, port, username, password
    - Create mysql2 connection pool with SSL enabled
    - _Requirements: 2.5, 3.3_
  
  - [ ]* 10.3 Write property test for build log secret protection
    - **Property 13: Build Log Secret Protection**
    - **Validates: Requirements 9.5**


- [ ] 11. Integrate AWS X-Ray tracing in Express backend
  - [ ] 11.1 Add X-Ray SDK and middleware to Express application
    - Install aws-xray-sdk-core dependency
    - Wrap AWS SDK with AWSXRay.captureAWS()
    - Add express.openSegment and express.closeSegment middleware
    - _Requirements: 13.6_
  
  - [ ] 11.2 Add custom subsegments for database queries and AI calls
    - Create subsegments for each database query with query metadata
    - Create subsegments for each AI service invocation
    - Add error annotations to subsegments on failures
    - _Requirements: 13.6_

- [ ] 12. Implement structured logging in Express backend
  - [ ] 12.1 Create logging module with JSON formatter
    - Install winston or pino logging library
    - Configure JSON formatter with required fields: timestamp, level, service, message
    - Add optional fields: traceId, userId, endpoint, statusCode, duration
    - _Requirements: 13.1_
  
  - [ ] 12.2 Add request logging middleware
    - Create middleware to log all incoming requests with method, path, userId
    - Log response with statusCode and duration
    - Extract X-Ray trace ID from headers and include in logs
    - _Requirements: 13.1_
  
  - [ ]* 12.3 Write property test for structured logging format
    - **Property 15: Structured Logging Format**
    - **Validates: Requirements 13.1**

- [ ] 13. Create ECS task definitions for Express and FastAPI services
  - [ ] 13.1 Create ECS task definition for Express backend
    - Define task with family: mindcare-express-backend
    - Set CPU: 1024, Memory: 2048, networkMode: awsvpc
    - Configure container with ECR image URI, port 3000
    - Add environment variables: NODE_ENV=production, AWS_REGION
    - Add secrets from Secrets Manager: DB_HOST, DB_PASSWORD
    - Configure CloudWatch logs with awslogs driver
    - Add health check: curl localhost:3000/health
    - _Requirements: 2.2, 2.5_
  
  - [ ] 13.2 Create ECS task definition for FastAPI AI service
    - Define task with family: mindcare-fastapi-ai
    - Set CPU: 1024, Memory: 2048, networkMode: awsvpc
    - Configure container with ECR image URI, port 8000
    - Add environment variables: ENVIRONMENT=production, AWS_REGION
    - Configure CloudWatch logs with awslogs driver
    - Add health check: python healthcheck.py
    - _Requirements: 2.2_

- [ ] 14. Create Application Load Balancer and target groups
  - [ ] 14.1 Create ALB in public subnets
    - Define ALB with scheme: internet-facing
    - Attach to public subnets across 3 AZs
    - Associate ALB security group
    - Enable access logs to S3 bucket
    - _Requirements: 2.1_
  
  - [ ] 14.2 Create target groups for Express and FastAPI services
    - Create target group: mindcare-express-tg, protocol: HTTP, port: 3000
    - Create target group: mindcare-fastapi-tg, protocol: HTTP, port: 8000
    - Configure health checks: path=/health, interval=30s, timeout=5s
    - Set deregistration delay: 30 seconds
    - _Requirements: 2.1_
  
  - [ ] 14.3 Create ALB listener rules for routing
    - Create HTTPS listener on port 443 with ACM certificate
    - Add rule: path /api/v1/ai/* → forward to mindcare-fastapi-tg
    - Add rule: path /api/v1/* → forward to mindcare-express-tg
    - _Requirements: 2.1_


- [ ] 15. Create ECS services with auto-scaling
  - [ ] 15.1 Create ECS Fargate cluster
    - Define cluster: mindcare-production
    - Enable Container Insights for monitoring
    - _Requirements: 2.2_
  
  - [ ] 15.2 Create ECS service for Express backend
    - Define service with task definition: mindcare-express-backend
    - Set desired count: 2, launch type: FARGATE
    - Attach to ALB target group: mindcare-express-tg
    - Configure network: private compute subnets, ECS security group
    - Enable deployment circuit breaker with rollback
    - _Requirements: 2.2, 2.3_
  
  - [ ] 15.3 Create ECS service for FastAPI AI service
    - Define service with task definition: mindcare-fastapi-ai
    - Set desired count: 2, launch type: FARGATE
    - Attach to ALB target group: mindcare-fastapi-tg
    - Configure network: private compute subnets, ECS security group
    - Enable deployment circuit breaker with rollback
    - _Requirements: 2.2_
  
  - [ ] 15.4 Configure auto-scaling policies for ECS services
    - Create target tracking policy: CPU utilization target 70%
    - Create target tracking policy: Memory utilization target 80%
    - Set min tasks: 2, max tasks: 20
    - _Requirements: 2.3_
  
  - [ ]* 15.5 Write property test for ECS auto-scaling under load
    - **Property 1: ECS Auto-Scaling Under Load**
    - **Validates: Requirements 2.3**
  
  - [ ]* 15.6 Write property test for ECS auto-scaling performance
    - **Property 26: ECS Auto-Scaling Performance**
    - **Validates: Requirements 20.2**

- [ ] 16. Checkpoint - Validate containerized backend deployment
  - Ensure all containers build successfully, verify ECS services running with 2 tasks each, test health check endpoints, validate auto-scaling triggers, verify X-Ray traces visible, ask the user if questions arise.

### Phase 3: Frontend Migration (Week 5)

- [ ] 17. Configure AWS Amplify hosting for React frontend
  - [ ] 17.1 Create Amplify app connected to source repository
    - Define Amplify app with repository connection (GitHub/CodeCommit)
    - Set branch: main for automatic deployments
    - Configure build settings with Node.js 18
    - _Requirements: 1.1, 1.5_
  
  - [ ] 17.2 Create amplify.yml build specification
    - Define build phases: install dependencies, run build, output build artifacts
    - Set build commands: npm ci, npm run build
    - Set output directory: build/
    - Add environment variables for API endpoint configuration
    - _Requirements: 1.1_

- [ ] 18. Update React frontend to use Amplify Auth SDK
  - [ ] 18.1 Install Amplify libraries and configure authentication
    - Add @aws-amplify/auth and @aws-amplify/api dependencies
    - Create amplify-config.js with Cognito user pool configuration
    - Configure Auth: region, userPoolId, userPoolWebClientId
    - Configure API: endpoint pointing to API Gateway URL
    - _Requirements: 8.7_
  
  - [ ] 18.2 Replace manual authentication with Amplify Auth
    - Update login component to use Auth.signIn()
    - Update registration component to use Auth.signUp()
    - Update logout to use Auth.signOut()
    - Implement token refresh with Auth.currentSession()
    - _Requirements: 8.7_
  
  - [ ] 18.3 Update API calls to include Cognito JWT tokens
    - Modify API client to retrieve current session tokens
    - Add Authorization header with ID token to all API requests
    - Handle 401 responses by refreshing tokens
    - _Requirements: 8.7_


- [ ] 19. Configure CloudFront distribution for frontend
  - [ ] 19.1 Create CloudFront distribution with Amplify origin
    - Define distribution with origin: Amplify hosting endpoint
    - Configure cache behavior: cache static assets, forward auth headers
    - Set minimum TLS version: 1.2
    - Add custom error response: 404 → /index.html (SPA routing)
    - _Requirements: 1.2_
  
  - [ ] 19.2 Configure ACM certificate for custom domain
    - Request ACM certificate for custom domain
    - Add CNAME records for domain validation
    - Attach certificate to CloudFront distribution
    - _Requirements: 1.2_
  
  - [ ] 19.3 Update frontend environment configuration
    - Remove hardcoded API URLs from code
    - Use environment variables: REACT_APP_API_GATEWAY_URL
    - Use environment variables: REACT_APP_COGNITO_USER_POOL_ID, REACT_APP_COGNITO_CLIENT_ID
    - _Requirements: 1.4_

- [ ] 20. Create API Gateway REST API
  - [ ] 20.1 Create API Gateway REST API with Cognito authorizer
    - Define REST API: mindcare-api, endpoint type: Regional
    - Create Cognito User Pool authorizer
    - Configure authorizer: identity source = Authorization header
    - _Requirements: 2.1, 2.4_
  
  - [ ] 20.2 Create API Gateway resources and methods
    - Create resource: /api/v1 with child resources: /auth, /users, /sessions, /ai, /admin
    - Create methods: GET, POST, PUT, DELETE for each resource
    - Configure method request validation with JSON schemas
    - Integrate methods with ALB using HTTP proxy integration
    - _Requirements: 2.1_
  
  - [ ] 20.3 Configure API Gateway throttling and CORS
    - Set throttling: 10,000 req/s burst, 5,000 req/s steady state
    - Enable CORS for Amplify origin domains
    - Configure CORS headers: Access-Control-Allow-Origin, Access-Control-Allow-Methods
    - _Requirements: 2.1, 17.4_
  
  - [ ]* 20.4 Write property test for API authentication and authorization
    - **Property 4: API Authentication and Authorization**
    - **Validates: Requirements 2.4, 8.5**
  
  - [ ]* 20.5 Write property test for API Gateway rate limiting
    - **Property 21: API Gateway Rate Limiting**
    - **Validates: Requirements 17.4**
  
  - [ ]* 20.6 Write property test for API Gateway response time SLA
    - **Property 27: API Gateway Response Time SLA**
    - **Validates: Requirements 20.3**

- [ ] 21. Checkpoint - Validate frontend deployment and API integration
  - Ensure frontend accessible via CloudFront, verify HTTPS enforcement, test authentication flows, validate API calls successful, verify CORS configuration, ask the user if questions arise.


### Phase 4: Database Migration (Weeks 6-7)

- [ ] 22. Export and validate local MySQL database schema
  - [ ] 22.1 Create database export script
    - Write bash script using mysqldump to export schema without data
    - Export with --no-data flag to schema_backup.sql
    - Export foreign key constraints and indexes
    - _Requirements: 3.5_
  
  - [ ] 22.2 Create database data export script
    - Write bash script using mysqldump with --single-transaction flag
    - Export all tables to data_backup.sql
    - Include --routines and --triggers flags
    - Calculate checksums for all tables
    - _Requirements: 3.5_

- [ ] 23. Create Aurora database schema
  - [ ] 23.1 Create database schema in Aurora cluster
    - Connect to Aurora using credentials from Secrets Manager
    - Execute schema_backup.sql to create all tables
    - Verify all tables created successfully
    - _Requirements: 3.5_
  
  - [ ] 23.2 Validate schema compatibility
    - Compare table structures between source and target
    - Verify all indexes exist in Aurora
    - Verify all foreign key constraints exist
    - _Requirements: 3.5_

- [ ] 24. Migrate data from local MySQL to Aurora
  - [ ] 24.1 Import data into Aurora database
    - Execute data_backup.sql against Aurora cluster
    - Monitor import progress and log any errors
    - _Requirements: 3.5, 18.1_
  
  - [ ] 24.2 Create data validation script
    - Write Python script to compare row counts for all tables
    - Calculate and compare checksums for all tables
    - Verify foreign key relationships preserved
    - Generate validation report
    - _Requirements: 3.5, 18.2_
  
  - [ ]* 24.3 Write property test for data migration integrity
    - **Property 3: Data Migration Integrity**
    - **Validates: Requirements 3.5, 18.1, 18.2, 18.3**

- [ ] 25. Test application queries against Aurora database
  - [ ] 25.1 Create query validation test suite
    - Identify all critical application queries (user lookup, session retrieval, message history)
    - Execute each query against both local MySQL and Aurora
    - Compare result sets for equivalence
    - Measure query execution times
    - _Requirements: 18.4_
  
  - [ ]* 25.2 Write property test for application query functional validation
    - **Property 22: Application Query Functional Validation**
    - **Validates: Requirements 18.4**
  
  - [ ]* 25.3 Write property test for Aurora query performance SLA
    - **Property 28: Aurora Query Performance SLA**
    - **Validates: Requirements 20.4**

- [ ] 26. Update Express backend database connection for Aurora
  - [ ] 26.1 Update database configuration to use Aurora endpoint
    - Modify database.js to use Aurora cluster endpoint from Secrets Manager
    - Enable SSL/TLS for Aurora connections
    - Download and include RDS CA certificate
    - _Requirements: 3.3_
  
  - [ ] 26.2 Test database connectivity from ECS containers
    - Deploy updated Express backend to ECS
    - Verify health check passes with Aurora connection
    - Test CRUD operations through API endpoints
    - _Requirements: 3.3_

- [ ] 27. Checkpoint - Validate database migration and application connectivity
  - Ensure all data migrated with matching row counts and checksums, verify application queries return correct results, test database connection from ECS, validate query performance, ask the user if questions arise.


### Phase 5: AI Services Migration (Weeks 8-9)

- [ ] 28. Implement AWS Bedrock integration for LLM
  - [ ] 28.1 Create Bedrock service module in FastAPI application
    - Install boto3 AWS SDK for Python
    - Create bedrock_service.py with invoke_model() function
    - Configure Bedrock runtime client with region
    - _Requirements: 4.1, 4.3_
  
  - [ ] 28.2 Implement prompt transformation for Bedrock
    - Create function to transform Gemini prompt format to Bedrock format
    - Support Anthropic Claude 3 Sonnet message format
    - Include system prompts and conversation history
    - _Requirements: 4.4_
  
  - [ ] 28.3 Implement response parsing and error handling
    - Parse Bedrock response JSON to extract text content
    - Extract token usage and model metadata
    - Implement exponential backoff retry for throttling errors
    - Implement circuit breaker pattern for service failures
    - _Requirements: 4.3_
  
  - [ ] 28.4 Add fallback to Amazon Titan model
    - Detect Bedrock Claude invocation failures
    - Retry with Amazon Titan Text Express model
    - Log fallback events to CloudWatch
    - _Requirements: 4.1_
  
  - [ ]* 28.5 Write property test for Bedrock prompt format compatibility
    - **Property 5: Bedrock Prompt Format Compatibility**
    - **Validates: Requirements 4.4**

- [ ] 29. Implement AWS Transcribe integration for speech-to-text
  - [ ] 29.1 Create Transcribe service module in FastAPI application
    - Create transcribe_service.py with start_transcription_job() function
    - Configure Transcribe client with region
    - _Requirements: 5.1, 5.3_
  
  - [ ] 29.2 Implement audio upload to S3 and transcription job
    - Create S3 bucket: mindcare-audio-input with lifecycle policy
    - Upload audio files to S3 with session-based key structure
    - Start transcription job with S3 URI
    - Configure language: en-US, enable speaker labels
    - _Requirements: 5.2, 5.3_
  
  - [ ] 29.3 Implement transcription job polling and result retrieval
    - Poll GetTranscriptionJob API until status is COMPLETED or FAILED
    - Download transcript JSON from S3
    - Parse transcript to extract text and timestamps
    - _Requirements: 5.2_
  
  - [ ]* 29.4 Write property test for Transcribe audio format support
    - **Property 6: Transcribe Audio Format Support**
    - **Validates: Requirements 5.2, 5.4**

- [ ] 30. Implement AWS Polly integration for text-to-speech
  - [ ] 30.1 Create Polly service module in FastAPI application
    - Create polly_service.py with synthesize_speech() function
    - Configure Polly client with region
    - _Requirements: 6.1, 6.3_
  
  - [ ] 30.2 Implement speech synthesis with Neural voices
    - Call SynthesizeSpeech API with text input
    - Configure voice: Joanna (Neural), engine: neural
    - Set output format: mp3, sample rate: 24000
    - _Requirements: 6.2, 6.3_
  
  - [ ] 30.3 Store synthesized audio in S3 and generate pre-signed URLs
    - Create S3 bucket: mindcare-audio-output with lifecycle policy
    - Upload audio stream to S3 with session-based key structure
    - Generate pre-signed URL with 1-hour expiration
    - _Requirements: 6.3_
  
  - [ ]* 30.4 Write property test for Polly voice and language support
    - **Property 7: Polly Voice and Language Support**
    - **Validates: Requirements 6.4**


- [ ] 31. Implement AWS Comprehend integration for emotion detection
  - [ ] 31.1 Create Comprehend service module in FastAPI application
    - Create comprehend_service.py with analyze_emotion() function
    - Configure Comprehend client with region
    - _Requirements: 7.1, 7.3_
  
  - [ ] 31.2 Implement sentiment and key phrase detection
    - Call DetectSentiment API with text input
    - Call DetectKeyPhrases API with text input
    - Parse sentiment scores: Positive, Negative, Neutral, Mixed
    - Extract key phrases from response
    - _Requirements: 7.2, 7.3_
  
  - [ ] 31.3 Create emotion mapping to legacy format
    - Implement map_to_legacy_emotions() function
    - Map POSITIVE sentiment to joy and surprise emotions
    - Map NEGATIVE sentiment to sadness, anger, fear emotions
    - Map NEUTRAL and MIXED sentiments appropriately
    - Return emotion scores compatible with existing application logic
    - _Requirements: 7.4_
  
  - [ ]* 31.4 Write property test for Comprehend sentiment analysis
    - **Property 8: Comprehend Sentiment Analysis**
    - **Validates: Requirements 7.2, 7.4**

- [ ] 32. Update FastAPI endpoints to use new AI services
  - [ ] 32.1 Update /ai/chat endpoint to use Bedrock
    - Replace Gemini API calls with Bedrock service
    - Maintain same request/response structure
    - Add error handling and logging
    - _Requirements: 4.1_
  
  - [ ] 32.2 Update /ai/transcribe endpoint to use Transcribe
    - Replace Whisper API calls with Transcribe service
    - Maintain same request/response structure
    - Add error handling and logging
    - _Requirements: 5.1_
  
  - [ ] 32.3 Update /ai/synthesize endpoint to use Polly
    - Replace gTTS calls with Polly service
    - Maintain same request/response structure
    - Add error handling and logging
    - _Requirements: 6.1_
  
  - [ ] 32.4 Update /ai/analyze-emotion endpoint to use Comprehend
    - Replace HuggingFace calls with Comprehend service
    - Apply emotion mapping to maintain compatibility
    - Add error handling and logging
    - _Requirements: 7.1_

- [ ] 33. Remove legacy AI service dependencies
  - [ ] 33.1 Remove third-party AI libraries from requirements.txt
    - Remove google-generativeai (Gemini)
    - Remove openai-whisper
    - Remove gTTS
    - Remove transformers (HuggingFace)
    - _Requirements: 4.1, 5.1, 6.1, 7.1_
  
  - [ ] 33.2 Remove legacy AI service code and configuration
    - Delete legacy service modules
    - Remove API keys from configuration
    - Update documentation to reflect AWS services
    - _Requirements: 4.1, 5.1, 6.1, 7.1_

- [ ] 34. Checkpoint - Validate AI services integration
  - Ensure all AI endpoints functional with AWS services, test Bedrock response quality, test Transcribe accuracy, test Polly audio quality, test Comprehend emotion mapping, ask the user if questions arise.


### Phase 6: Authentication Migration (Week 10)

- [ ] 35. Create AWS Cognito user pool and configure groups
  - [ ] 35.1 Create Cognito user pool with password policy
    - Define user pool: mindcare-user-pool
    - Configure sign-in: email address
    - Set password policy: min 8 chars, require uppercase, lowercase, numbers, symbols
    - Enable MFA: optional (SMS or TOTP)
    - Configure account recovery: email verification code
    - _Requirements: 8.1, 8.2_
  
  - [ ] 35.2 Create user groups for role-based access
    - Create group: USER with precedence 3
    - Create group: COUNSELLOR with precedence 2
    - Create group: ADMIN with precedence 1
    - _Requirements: 8.2_
  
  - [ ] 35.3 Add custom attributes for user metadata
    - Add custom attribute: role (String, mutable)
    - Add custom attribute: license_number (String, mutable)
    - Add custom attribute: specialization (String, mutable)
    - Add custom attribute: onboarding_completed (String, mutable)
    - _Requirements: 8.2_
  
  - [ ]* 35.4 Write property test for Cognito user registration
    - **Property 9: Cognito User Registration**
    - **Validates: Requirements 8.3**
  
  - [ ]* 35.5 Write property test for Cognito authentication token issuance
    - **Property 10: Cognito Authentication Token Issuance**
    - **Validates: Requirements 8.4**

- [ ] 36. Create Lambda function for user migration
  - [ ] 36.1 Create user migration Lambda function
    - Create Lambda function in Python 3.11
    - Implement lambda_handler for UserMigration_Authentication trigger
    - Query legacy database for user by username
    - Verify password using bcrypt.checkpw()
    - Return user attributes for successful authentication
    - _Requirements: 8.6_
  
  - [ ] 36.2 Configure Cognito user pool migration trigger
    - Attach Lambda function to Cognito user pool
    - Configure trigger: User Migration
    - Grant Lambda permission to access legacy database
    - _Requirements: 8.6_
  
  - [ ]* 36.3 Write property test for user account migration
    - **Property 11: User Account Migration**
    - **Validates: Requirements 8.6**

- [ ] 37. Update Express backend to validate Cognito JWT tokens
  - [ ] 37.1 Create JWT validation middleware
    - Install jsonwebtoken and jwks-rsa libraries
    - Create middleware to extract Authorization header
    - Verify JWT signature using Cognito JWKS endpoint
    - Decode token and extract user claims (sub, email, cognito:groups)
    - Attach user context to request object
    - _Requirements: 8.5_
  
  - [ ] 37.2 Update authorization logic to use Cognito groups
    - Replace role checks with cognito:groups claim checks
    - Implement role-based access control for endpoints
    - Return 403 Forbidden for insufficient permissions
    - _Requirements: 8.5_
  
  - [ ] 37.3 Remove legacy bcryptjs authentication code
    - Delete password hashing and verification functions
    - Remove manual JWT token generation
    - Remove legacy authentication middleware
    - _Requirements: 8.1_


- [ ] 38. Migrate existing users to Cognito
  - [ ] 38.1 Create user migration script
    - Write Python script to export all users from legacy database
    - For each user, call Cognito AdminCreateUser API
    - Set user attributes: email, custom:role, custom:license_number
    - Set temporary password and require password change on first login
    - Add users to appropriate Cognito groups
    - _Requirements: 8.6_
  
  - [ ] 38.2 Execute user migration and validate
    - Run migration script against Cognito user pool
    - Log migration results (success/failure for each user)
    - Verify all users created in Cognito
    - Test login for sample users with existing passwords (via migration trigger)
    - _Requirements: 8.6_

- [ ] 39. Update frontend authentication flows
  - [ ] 39.1 Update login flow to use Cognito
    - Replace manual login API call with Auth.signIn()
    - Handle Cognito authentication challenges
    - Store JWT tokens in memory (not localStorage)
    - _Requirements: 8.7_
  
  - [ ] 39.2 Update registration flow to use Cognito
    - Replace manual registration API call with Auth.signUp()
    - Implement email verification flow
    - Handle verification code submission
    - _Requirements: 8.7_
  
  - [ ] 39.3 Update password reset flow to use Cognito
    - Implement forgot password with Auth.forgotPassword()
    - Implement password reset with Auth.forgotPasswordSubmit()
    - _Requirements: 8.7_
  
  - [ ] 39.4 Implement token refresh logic
    - Use Auth.currentSession() to get valid tokens
    - Automatically refresh tokens before expiration
    - Handle refresh token expiration (redirect to login)
    - _Requirements: 8.7_

- [ ] 40. Checkpoint - Validate authentication migration
  - Ensure all users migrated to Cognito, test login with existing passwords, verify JWT token validation, test role-based access control, validate token refresh, ask the user if questions arise.

### Phase 7: CI/CD Pipeline Setup (Week 11)

- [ ] 41. Create CodeBuild project for Express backend
  - [ ] 41.1 Create buildspec.yml for Express backend
    - Define pre_build phase: ECR login, set image tag from commit hash
    - Define build phase: npm ci, npm test, npm run lint, docker build
    - Define post_build phase: docker push, create imagedefinitions.json
    - _Requirements: 14.1, 14.3_
  
  - [ ] 41.2 Create CodeBuild project resource
    - Define project: mindcare-express-build
    - Set source: CodeCommit repository
    - Set environment: Ubuntu, Docker, privileged mode
    - Attach IAM role with ECR and CloudWatch permissions
    - _Requirements: 14.1_
  
  - [ ]* 41.3 Write property test for CI/CD build and push on test success
    - **Property 17: CI/CD Build and Push on Test Success**
    - **Validates: Requirements 14.3**


- [ ] 42. Create CodeBuild project for FastAPI AI service
  - [ ] 42.1 Create buildspec.yml for FastAPI service
    - Define pre_build phase: ECR login, set image tag from commit hash
    - Define build phase: pip install, pytest, docker build
    - Define post_build phase: docker push, create imagedefinitions.json
    - _Requirements: 14.1, 14.3_
  
  - [ ] 42.2 Create CodeBuild project resource
    - Define project: mindcare-fastapi-build
    - Set source: CodeCommit repository
    - Set environment: Ubuntu, Docker, privileged mode
    - Attach IAM role with ECR and CloudWatch permissions
    - _Requirements: 14.1_

- [ ] 43. Create CodePipeline for automated deployments
  - [ ] 43.1 Create pipeline for Express backend
    - Define pipeline: mindcare-express-pipeline
    - Add Source stage: CodeCommit repository, branch: main
    - Add Build stage: CodeBuild project mindcare-express-build
    - Add Deploy to Dev stage: ECS deployment to dev cluster
    - Add Deploy to Staging stage: ECS deployment to staging cluster
    - Add Manual Approval stage for production
    - Add Deploy to Production stage: ECS deployment to production cluster
    - _Requirements: 14.2, 14.4_
  
  - [ ] 43.2 Create pipeline for FastAPI AI service
    - Define pipeline: mindcare-fastapi-pipeline
    - Add Source stage: CodeCommit repository, branch: main
    - Add Build stage: CodeBuild project mindcare-fastapi-build
    - Add Deploy to Dev stage: ECS deployment to dev cluster
    - Add Deploy to Staging stage: ECS deployment to staging cluster
    - Add Manual Approval stage for production
    - Add Deploy to Production stage: ECS deployment to production cluster
    - _Requirements: 14.2, 14.4_

- [ ] 44. Configure ECS deployment with health checks and rollback
  - [ ] 44.1 Configure deployment circuit breaker for ECS services
    - Enable circuit breaker on all ECS services
    - Set failure threshold: 2 consecutive health check failures
    - Enable automatic rollback on deployment failure
    - _Requirements: 14.6_
  
  - [ ] 44.2 Configure deployment health check grace period
    - Set health check grace period: 60 seconds for container startup
    - Configure deregistration delay: 30 seconds
    - _Requirements: 14.5_
  
  - [ ]* 44.3 Write property test for deployment health check validation
    - **Property 18: Deployment Health Check Validation**
    - **Validates: Requirements 14.5**
  
  - [ ]* 44.4 Write property test for deployment rollback on failure
    - **Property 19: Deployment Rollback on Failure**
    - **Validates: Requirements 14.6**

- [ ] 45. Checkpoint - Validate CI/CD pipeline
  - Ensure pipelines trigger on code commits, verify build and test stages pass, test deployment to dev environment, validate health checks, test rollback on failure, ask the user if questions arise.


### Phase 8: User Data Migration to Cloud Storage (Week 12)

- [ ] 46. Create S3 buckets for user data storage
  - [ ] 46.1 Create S3 buckets with encryption and lifecycle policies
    - Create bucket: mindcare-audio-input with KMS encryption
    - Create bucket: mindcare-audio-output with KMS encryption
    - Create bucket: mindcare-transcriptions with KMS encryption
    - Set lifecycle policy: delete objects after 90 days
    - Set lifecycle policy: transition to Glacier after 30 days
    - _Requirements: 19.2_
  
  - [ ] 46.2 Configure S3 bucket policies for ECS access
    - Create bucket policy allowing GetObject, PutObject, DeleteObject
    - Restrict access to ECS task role only
    - Enable versioning for audit trail
    - _Requirements: 19.2_

- [ ] 47. Implement user preference synchronization
  - [ ] 47.1 Create user preferences API endpoints
    - Implement GET /users/{userId}/preferences endpoint
    - Implement PUT /users/{userId}/preferences endpoint
    - Store preferences in Aurora user_preferences table
    - _Requirements: 19.3_
  
  - [ ] 47.2 Update frontend to sync preferences with backend
    - Fetch user preferences on login
    - Update preferences on change with API call
    - Cache preferences locally for offline access
    - _Requirements: 19.3_
  
  - [ ]* 47.3 Write property test for user preference cross-device synchronization
    - **Property 23: User Preference Cross-Device Synchronization**
    - **Validates: Requirements 19.3**

- [ ] 48. Migrate localStorage data to cloud storage
  - [ ] 48.1 Create localStorage migration script for frontend
    - Detect localStorage data on user login
    - Extract user preferences, session data, cached content
    - Send data to backend API for storage
    - Clear localStorage after successful migration
    - _Requirements: 19.4_
  
  - [ ] 48.2 Create backend endpoints for localStorage migration
    - Implement POST /users/{userId}/migrate-data endpoint
    - Parse localStorage data and store in appropriate tables
    - Return migration status and confirmation
    - _Requirements: 19.4_
  
  - [ ]* 48.3 Write property test for user data migration from localStorage
    - **Property 24: User Data Migration from localStorage**
    - **Validates: Requirements 19.4**

- [ ] 49. Implement offline data synchronization
  - [ ] 49.1 Create service worker for offline caching
    - Implement service worker with cache-first strategy for static assets
    - Implement network-first strategy for API calls
    - Cache failed API requests in IndexedDB
    - _Requirements: 19.5_
  
  - [ ] 49.2 Implement background sync for offline actions
    - Register background sync event on connectivity restore
    - Retrieve cached requests from IndexedDB
    - Replay requests to backend API
    - Clear cache on successful sync
    - _Requirements: 19.5_
  
  - [ ]* 49.3 Write property test for offline data synchronization
    - **Property 25: Offline Data Synchronization**
    - **Validates: Requirements 19.5**

- [ ] 50. Checkpoint - Validate user data migration and synchronization
  - Ensure S3 buckets created with encryption, test preference synchronization, validate localStorage migration, test offline sync, ask the user if questions arise.


### Phase 9: Integration and Load Testing (Week 13)

- [ ] 51. Create integration test suite for end-to-end workflows
  - [ ] 51.1 Write integration tests for user registration and login
    - Test user registration with Cognito
    - Test email verification flow
    - Test login with valid credentials
    - Test login with invalid credentials
    - Test token refresh
    - _Requirements: 8.3, 8.4_
  
  - [ ] 51.2 Write integration tests for session management
    - Test session creation with authentication
    - Test session retrieval
    - Test session status updates
    - Test session persistence in Aurora
    - _Requirements: 18.4_
  
  - [ ] 51.3 Write integration tests for AI workflows
    - Test AI chat with Bedrock end-to-end
    - Test audio transcription with Transcribe
    - Test speech synthesis with Polly
    - Test emotion analysis with Comprehend
    - _Requirements: 4.5, 5.5, 6.5, 7.5_
  
  - [ ] 51.4 Write integration tests for cross-device synchronization
    - Test preference updates across devices
    - Test localStorage migration
    - Test offline sync on connectivity restore
    - _Requirements: 19.3, 19.4, 19.5_

- [ ] 52. Create load testing configuration with Artillery
  - [ ] 52.1 Create Artillery load test scenarios
    - Create scenario: User Session Flow (70% weight)
    - Create scenario: AI Service Calls (30% weight)
    - Configure phases: warm-up (5 min, 10 req/s), sustained (10 min, 50 req/s), peak (5 min, 100 req/s)
    - _Requirements: 20.1_
  
  - [ ] 52.2 Create authentication processor for load tests
    - Implement auth-processor.js to handle Cognito login
    - Generate random test users
    - Capture and reuse JWT tokens
    - _Requirements: 20.1_

- [ ] 53. Execute load tests and validate auto-scaling
  - [ ] 53.1 Run load tests against staging environment
    - Execute Artillery load test with configured scenarios
    - Monitor CloudWatch metrics during test
    - Observe ECS auto-scaling behavior
    - Observe Aurora auto-scaling behavior
    - _Requirements: 20.1, 20.2_
  
  - [ ] 53.2 Analyze load test results and optimize
    - Review response time percentiles (p50, p95, p99)
    - Identify performance bottlenecks
    - Optimize slow queries or endpoints
    - Adjust auto-scaling thresholds if needed
    - Re-run load tests to validate improvements
    - _Requirements: 20.3, 20.4_

- [ ] 54. Create performance monitoring dashboard
  - [ ] 54.1 Create CloudWatch dashboard for key metrics
    - Add widgets for API Gateway request count, latency, errors
    - Add widgets for ECS CPU, memory, task count
    - Add widgets for Aurora connections, IOPS, query latency
    - Add widgets for AI service invocations and costs
    - _Requirements: 13.5_
  
  - [ ] 54.2 Configure CloudWatch alarms for performance SLAs
    - Create alarm: API latency p95 > 500ms
    - Create alarm: API latency p99 > 1000ms
    - Create alarm: Database query latency p95 > 100ms
    - _Requirements: 20.3, 20.4_

- [ ] 55. Checkpoint - Validate integration tests and performance
  - Ensure all integration tests passing, verify load tests complete successfully, validate auto-scaling working, confirm performance SLAs met, ask the user if questions arise.


### Phase 10: Security Hardening and Production Deployment (Week 14)

- [ ] 56. Perform security validation and hardening
  - [ ] 56.1 Review and validate IAM policies for least privilege
    - Audit all IAM roles and policies
    - Remove unnecessary permissions
    - Ensure resource-level restrictions where possible
    - Document IAM role mappings
    - _Requirements: 12.2, 12.5_
  
  - [ ] 56.2 Scan container images for vulnerabilities
    - Enable ECR image scanning on push
    - Review scan results for critical vulnerabilities
    - Update base images and dependencies to fix vulnerabilities
    - Rebuild and rescan images
    - _Requirements: 10.4_
  
  - [ ] 56.3 Validate encryption at rest and in transit
    - Verify Aurora encryption enabled with KMS
    - Verify S3 bucket encryption enabled with KMS
    - Verify Secrets Manager encryption enabled
    - Verify HTTPS enforcement on CloudFront and API Gateway
    - Verify TLS 1.2 minimum on all endpoints
    - _Requirements: 3.6, 15.2_
  
  - [ ] 56.4 Test API rate limiting and throttling
    - Simulate high request volume to trigger throttling
    - Verify 429 responses returned when limits exceeded
    - Verify rate limiting per client
    - _Requirements: 17.4_
  
  - [ ] 56.5 Review CloudWatch logs for sensitive data exposure
    - Scan logs for database passwords, API keys, tokens
    - Implement log scrubbing if sensitive data found
    - Verify secrets not exposed in build logs
    - _Requirements: 9.5_

- [ ] 57. Configure secrets rotation
  - [ ] 57.1 Enable automatic rotation for database credentials
    - Create Lambda rotation function for Aurora credentials
    - Configure rotation schedule: every 90 days
    - Test rotation without service disruption
    - _Requirements: 9.4_
  
  - [ ] 57.2 Test application resilience during rotation
    - Trigger manual rotation
    - Verify application continues to function
    - Verify new credentials retrieved from Secrets Manager
    - _Requirements: 9.4_

- [ ] 58. Create disaster recovery and backup procedures
  - [ ] 58.1 Configure Aurora automated backups
    - Verify backup retention: 7 days
    - Enable automated snapshots
    - Test point-in-time recovery
    - _Requirements: 3.1, 15.3_
  
  - [ ] 58.2 Create backup and restore scripts
    - Write script to create manual Aurora snapshot
    - Write script to restore from snapshot to new cluster
    - Test restore procedure in non-production environment
    - Document recovery time objective (RTO) and recovery point objective (RPO)
    - _Requirements: 15.3_


- [ ] 59. Deploy to production environment
  - [ ] 59.1 Provision production infrastructure
    - Execute Terraform/CloudFormation templates for production
    - Verify all resources created with production tags
    - Configure production-specific settings (multi-AZ, higher capacity)
    - _Requirements: 11.7_
  
  - [ ] 59.2 Deploy application containers to production
    - Deploy Express backend to production ECS cluster
    - Deploy FastAPI AI service to production ECS cluster
    - Verify health checks passing
    - Verify auto-scaling configured
    - _Requirements: 2.2, 2.3_
  
  - [ ] 59.3 Migrate production database to Aurora
    - Export production MySQL database
    - Import data to production Aurora cluster
    - Validate data integrity with checksums
    - Test critical queries
    - _Requirements: 3.5, 18.1, 18.2_
  
  - [ ] 59.4 Migrate production users to Cognito
    - Run user migration script against production
    - Verify all users migrated successfully
    - Test login for sample production users
    - _Requirements: 8.6_

- [ ] 60. Execute production cutover
  - [ ] 60.1 Update DNS to point to CloudFront distribution
    - Update DNS A/CNAME records to CloudFront endpoint
    - Set low TTL initially for quick rollback if needed
    - Monitor DNS propagation
    - _Requirements: 1.3_
  
  - [ ] 60.2 Monitor application health post-cutover
    - Monitor CloudWatch metrics for 1 hour
    - Watch for critical alarms
    - Monitor error rates and latency
    - Verify user traffic flowing through AWS
    - _Requirements: 13.2, 13.3_
  
  - [ ] 60.3 Validate critical workflows in production
    - Test user registration and login
    - Test session creation
    - Test AI chat interactions
    - Test audio transcription and synthesis
    - _Requirements: 18.4_

- [ ] 61. Create rollback procedure documentation
  - [ ] 61.1 Document rollback triggers and procedure
    - Define rollback triggers: critical functionality broken, data integrity issues, performance degradation > 50%
    - Document rollback steps: update DNS, stop ECS services, restore local database
    - Document rollback time estimate: 30 minutes
    - Create rollback runbook with step-by-step instructions
    - _Requirements: 15.4_
  
  - [ ] 61.2 Test rollback procedure in staging
    - Simulate production cutover in staging
    - Execute rollback procedure
    - Measure rollback time
    - Verify local infrastructure restored
    - _Requirements: 15.4_

- [ ] 62. Final checkpoint - Production validation
  - Ensure production deployment successful, verify all health checks passing, confirm no critical alarms, validate user traffic flowing, test all critical workflows, ask the user if questions arise.


### Phase 11: Post-Migration Optimization and Documentation (Post-Week 14)

- [ ] 63. Optimize resource utilization and costs
  - [ ] 63.1 Review CloudWatch metrics for resource utilization
    - Analyze ECS CPU and memory utilization patterns
    - Analyze Aurora ACU utilization patterns
    - Identify over-provisioned or under-utilized resources
    - _Requirements: 16.1_
  
  - [ ] 63.2 Right-size ECS task definitions
    - Adjust CPU and memory allocations based on actual usage
    - Update task definitions with optimized values
    - Deploy and monitor for performance impact
    - _Requirements: 16.1_
  
  - [ ] 63.3 Optimize Aurora capacity settings
    - Adjust min/max ACU based on actual workload
    - Configure Aurora auto-pause for non-production environments
    - _Requirements: 16.1_
  
  - [ ] 63.4 Implement cost allocation tags
    - Verify all resources tagged with Project, Environment, ManagedBy, CostCenter
    - Enable cost allocation tags in AWS Billing
    - Create cost reports by tag
    - _Requirements: 16.6_

- [ ] 64. Create operational documentation
  - [ ] 64.1 Document architecture and component interactions
    - Create architecture diagrams for all environments
    - Document data flow between components
    - Document API endpoints and authentication
    - _Requirements: 11.5_
  
  - [ ] 64.2 Document deployment procedures
    - Document CI/CD pipeline usage
    - Document manual deployment steps for emergencies
    - Document rollback procedures
    - _Requirements: 14.2_
  
  - [ ] 64.3 Document monitoring and alerting
    - Document CloudWatch dashboards and metrics
    - Document alarm thresholds and escalation procedures
    - Document log analysis procedures
    - _Requirements: 13.5_
  
  - [ ] 64.4 Document disaster recovery procedures
    - Document backup and restore procedures
    - Document RTO and RPO targets
    - Document failover procedures for multi-AZ
    - _Requirements: 15.3, 15.4_

- [ ] 65. Decommission local infrastructure
  - [ ] 65.1 Validate AWS infrastructure stability
    - Monitor production for 1 week post-cutover
    - Verify no critical issues or rollbacks needed
    - Confirm all users migrated successfully
    - _Requirements: 18.5_
  
  - [ ] 65.2 Create final backup of local infrastructure
    - Create full backup of local MySQL database
    - Archive local application code and configuration
    - Store backups in secure location for 90 days
    - _Requirements: 18.5_
  
  - [ ] 65.3 Shut down local services
    - Stop local application services
    - Stop local database services
    - Decommission local servers
    - _Requirements: 18.5_

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at the end of each phase
- Property tests validate universal correctness properties from the design document
- Integration tests validate specific examples and edge cases
- The migration follows a phased approach to minimize risk and enable rollback at each stage
- All infrastructure is defined as code for reproducibility across environments
- Security is implemented at every layer with encryption, least-privilege access, and comprehensive monitoring

