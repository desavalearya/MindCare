# MindCare AWS Setup Guide - Step-by-Step Implementation

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [AWS Account Setup](#aws-account-setup)
3. [Region Selection](#region-selection)
4. [Service Setup Order](#service-setup-order)
5. [Detailed Service Configuration](#detailed-service-configuration)
6. [Environment Configuration](#environment-configuration)
7. [Testing & Verification](#testing--verification)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools
- AWS Account with billing enabled
- AWS CLI installed (version 2.x)
- Node.js 20.x or higher
- MySQL client or MySQL Workbench
- Text editor (VS Code recommended)
- Git

### AWS CLI Installation
**Windows**:
```powershell
# Download from https://awscli.amazonaws.com/AWSCLIV2.msi
# Run installer
# Verify installation
aws --version
```

**Mac**:
```bash
brew install awscli
aws --version
```

**Linux**:
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
aws --version
```

### AWS CLI Configuration
```bash
aws configure
# Enter:
# AWS Access Key ID: AKIAXGR5Q7QN6N6LFHTF
# AWS Secret Access Key: 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
# Default region: us-east-1
# Default output format: json
```

---

## AWS Account Setup

### Step 1: Sign in to AWS Console
1. Go to https://console.aws.amazon.com
2. Sign in with your AWS account
3. Verify you're in the correct region (us-east-1)

### Step 2: Enable Billing Alerts
1. Click your account name (top right) → "Billing and Cost Management"
2. Left sidebar → "Billing preferences"
3. Check "Receive Billing Alerts"
4. Enter email address
5. Click "Save preferences"

### Step 3: Set Up Budget Alert
1. Left sidebar → "Budgets"
2. Click "Create budget"
3. Select "Cost budget"
4. Budget name: "MindCare-Monthly-Budget"
5. Budgeted amount: $500 (adjust as needed)
6. Alert threshold: 80%
7. Email: your-email@example.com
8. Click "Create budget"

---

## Region Selection

**Primary Region**: us-east-1 (US East - N. Virginia)

**Rationale**:
- Lowest latency for US users
- All AWS services available
- Bedrock Claude 3 Sonnet available
- Most cost-effective region
- Largest AWS region with best reliability

**Important**: Use us-east-1 for ALL services to minimize latency and data transfer costs.

---

## Service Setup Order

Services must be created in this specific order due to dependencies:

1. IAM Roles & Policies (Required by all services)
2. Amazon S3 Buckets (Required by Lambda, Transcribe, Polly)
3. Amazon Cognito User Pool (Required by API Gateway, Lambda)
4. Amazon Cognito Identity Pool (Required by frontend)
5. AWS Secrets Manager (Required by Lambda for DB credentials)
6. Amazon Aurora MySQL (Database)
7. AWS Lambda Functions (Required by API Gateway)
8. Amazon API Gateway (REST API)
9. Amazon Bedrock Model Access (Required by chat Lambda)
10. Amazon CloudWatch (Logging)
11. Amazon CloudFront (CDN)
12. AWS Amplify (Frontend hosting)

---


## Detailed Service Configuration

### SERVICE 1: IAM Roles & Policies

**Purpose**: Create IAM roles and policies for Lambda functions and other services

**Estimated Time**: 15 minutes

**Region**: Global (but create in us-east-1 console)

#### Step 1.1: Create Lambda Execution Role

1. Go to AWS Console → Search "IAM" → Click "IAM"
2. Left sidebar → Click "Roles"
3. Click "Create role" button (orange button, top right)
4. **Select trusted entity**:
   - Trusted entity type: "AWS service"
   - Use case: Select "Lambda"
   - Click "Next"
5. **Add permissions**:
   - Search and select these policies (use search box):
     - ✅ AWSLambdaBasicExecutionRole
     - ✅ AmazonCognitoPowerUser
     - ✅ AmazonS3FullAccess
     - ✅ AmazonTranscribeFullAccess
     - ✅ AmazonPollyFullAccess
     - ✅ SecretsManagerReadWrite
     - ✅ CloudWatchFullAccess
   - Click "Next"
6. **Name and review**:
   - Role name: `MindCare-Lambda-Execution-Role`
   - Description: "Execution role for MindCare Lambda functions"
   - Click "Create role"

#### Step 1.2: Add Bedrock Permissions to Lambda Role

1. In IAM Roles list, search for "MindCare-Lambda-Execution-Role"
2. Click on the role name
3. Click "Add permissions" → "Create inline policy"
4. Click "JSON" tab
5. Paste this policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "arn:aws:bedrock:us-east-1::foundation-model/*"
    }
  ]
}
```
6. Click "Review policy"
7. Policy name: `BedrockInvokeModel`
8. Click "Create policy"

#### Step 1.3: Create Frontend User Role (for Cognito Identity Pool)

1. IAM → Roles → "Create role"
2. **Select trusted entity**:
   - Trusted entity type: "Web identity"
   - Identity provider: "Amazon Cognito"
   - Click "Next"
3. **Add permissions**:
   - Search and select:
     - ✅ AmazonS3ReadOnlyAccess
   - Click "Next"
4. **Name and review**:
   - Role name: `MindCare-Frontend-User-Role`
   - Description: "Role for authenticated frontend users"
   - Click "Create role"

**Verification**:
- ✅ MindCare-Lambda-Execution-Role exists
- ✅ MindCare-Frontend-User-Role exists
- ✅ Copy both Role ARNs (you'll need them later)

---

### SERVICE 2: Amazon S3 Buckets

**Purpose**: Store audio files, user content, and transcription results

**Estimated Time**: 10 minutes

**Region**: us-east-1

#### Step 2.1: Create Audio Uploads Bucket

1. Go to AWS Console → Search "S3" → Click "S3"
2. Click "Create bucket" (orange button)
3. **General configuration**:
   - Bucket name: `mindcare-audio-uploads-495124020251` (must be globally unique)
   - AWS Region: "US East (N. Virginia) us-east-1"
4. **Object Ownership**:
   - Select "ACLs disabled (recommended)"
5. **Block Public Access settings**:
   - ✅ Keep "Block all public access" CHECKED (security best practice)
6. **Bucket Versioning**:
   - Select "Disable"
7. **Default encryption**:
   - Encryption type: "Server-side encryption with Amazon S3 managed keys (SSE-S3)"
8. Click "Create bucket"

#### Step 2.2: Configure CORS for Audio Bucket

1. Click on bucket name "mindcare-audio-uploads-495124020251"
2. Click "Permissions" tab
3. Scroll down to "Cross-origin resource sharing (CORS)"
4. Click "Edit"
5. Paste this CORS configuration:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": [
      "http://localhost:5173",
      "https://mindcare.com",
      "https://*.amplifyapp.com"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```
6. Click "Save changes"

#### Step 2.3: Create User Content Bucket

1. S3 Console → Click "Create bucket"
2. **General configuration**:
   - Bucket name: `mindcare-user-content-495124020251`
   - AWS Region: "US East (N. Virginia) us-east-1"
3. **Object Ownership**: ACLs disabled
4. **Block Public Access**: ✅ Block all public access
5. **Bucket Versioning**: Disable
6. **Default encryption**: SSE-S3
7. Click "Create bucket"

#### Step 2.4: Configure CORS for User Content Bucket

1. Click on "mindcare-user-content-495124020251"
2. Permissions tab → CORS → Edit
3. Paste same CORS configuration as above
4. Click "Save changes"

#### Step 2.5: Create Lifecycle Policy (Optional - Cost Optimization)

1. Click on "mindcare-audio-uploads-495124020251"
2. Click "Management" tab
3. Click "Create lifecycle rule"
4. **Lifecycle rule configuration**:
   - Rule name: "Delete-Old-Audio-Files"
   - Choose rule scope: "Apply to all objects in the bucket"
5. **Lifecycle rule actions**:
   - ✅ Check "Expire current versions of objects"
   - Days after object creation: 30
6. Click "Create rule"

**Verification**:
- ✅ mindcare-audio-uploads-495124020251 bucket exists
- ✅ mindcare-user-content-495124020251 bucket exists
- ✅ CORS configured on both buckets
- ✅ Copy bucket names (you'll need them for .env)

---

### SERVICE 3: Amazon Cognito User Pool

**Purpose**: User authentication and management

**Estimated Time**: 15 minutes

**Region**: us-east-1

#### Step 3.1: Create User Pool

1. Go to AWS Console → Search "Cognito" → Click "Amazon Cognito"
2. Click "Create user pool" (orange button)

#### Step 3.2: Configure Sign-in Experience

1. **Cognito user pool sign-in options**:
   - Provider types: ✅ "Cognito user pool"
   - Cognito user pool sign-in options:
     - ✅ Email
     - ⬜ Phone number (uncheck)
     - ⬜ Username (uncheck)
2. Click "Next"

#### Step 3.3: Configure Security Requirements

1. **Password policy**:
   - Password policy mode: "Cognito defaults"
   - Password minimum length: 8
   - Password requirements:
     - ✅ Contains at least 1 number
     - ✅ Contains at least 1 special character
     - ✅ Contains at least 1 uppercase letter
     - ✅ Contains at least 1 lowercase letter
2. **Multi-factor authentication**:
   - MFA enforcement: "Optional MFA" (recommended for production)
   - MFA methods: ✅ Authenticator apps
3. **User account recovery**:
   - Self-service account recovery: ✅ Enable
   - Delivery method: "Email only"
4. Click "Next"

#### Step 3.4: Configure Sign-up Experience

1. **Self-service sign-up**:
   - ✅ Enable self-registration
2. **Attribute verification and user account confirmation**:
   - Cognito-assisted verification: ✅ "Allow Cognito to automatically send messages to verify and confirm"
   - Attributes to verify: ✅ "Send email message, verify email address"
3. **Required attributes**:
   - ✅ email (already selected)
   - ✅ name
4. **Custom attributes**:
   - Click "Add custom attribute"
   - Attribute name: `role`
   - Type: "String"
   - Min length: 1
   - Max length: 20
   - Mutable: ✅ Yes
   - Click "Add"
5. Click "Next"

#### Step 3.5: Configure Message Delivery

1. **Email**:
   - Email provider: "Send email with Cognito"
   - FROM email address: "no-reply@verificationemail.com" (default)
   - Reply-to email address: (leave blank)
2. **SMS** (if MFA enabled):
   - Skip for now (can configure later)
3. Click "Next"

#### Step 3.6: Integrate Your App

1. **User pool name**:
   - User pool name: `mindcare-users`
2. **Hosted authentication pages**:
   - ⬜ Use the Cognito Hosted UI (uncheck - we have custom UI)
3. **Initial app client**:
   - App type: "Public client"
   - App client name: `mindcare-web-client`
   - Client secret: "Don't generate a client secret"
   - Authentication flows:
     - ✅ ALLOW_USER_PASSWORD_AUTH
     - ✅ ALLOW_REFRESH_TOKEN_AUTH
     - ✅ ALLOW_USER_SRP_AUTH
4. Click "Next"

#### Step 3.7: Review and Create

1. Review all settings
2. Click "Create user pool"
3. **IMPORTANT**: Copy these values (you'll need them):
   - User Pool ID (e.g., `us-east-1_ABC123XYZ`)
   - App Client ID (e.g., `1a2b3c4d5e6f7g8h9i0j`)

**Verification**:
- ✅ User pool "mindcare-users" created
- ✅ User Pool ID copied
- ✅ App Client ID copied
- ✅ Custom attribute "role" exists

---

### SERVICE 4: Amazon Cognito Identity Pool

**Purpose**: Provide AWS credentials to authenticated users for S3 access

**Estimated Time**: 10 minutes

**Region**: us-east-1

#### Step 4.1: Create Identity Pool

1. Cognito Console → Left sidebar → Click "Federated identities" (or "Identity pools")
2. Click "Create identity pool" (or "Create new identity pool")
3. **Identity pool name**: `mindcare_identity_pool`
4. **Unauthenticated identities**:
   - ⬜ Enable access to unauthenticated identities (uncheck)
5. **Authentication providers**:
   - Expand "Cognito" section
   - User Pool ID: Paste your User Pool ID from Step 3.7
   - App Client ID: Paste your App Client ID from Step 3.7
6. Click "Create pool"

#### Step 4.2: Configure IAM Roles

1. **Authenticated role**:
   - IAM role: "Create a new IAM Role"
   - Role name: `Cognito_mindcare_identity_poolAuth_Role` (auto-generated)
2. **Unauthenticated role**:
   - Skip (we disabled unauthenticated access)
3. Click "Allow"

#### Step 4.3: Update Authenticated Role Permissions

1. Go to IAM Console → Roles
2. Search for "Cognito_mindcare_identity_poolAuth_Role"
3. Click on the role
4. Click "Add permissions" → "Attach policies"
5. Search and attach:
   - ✅ AmazonS3ReadOnlyAccess
6. Click "Add permissions"

#### Step 4.4: Get Identity Pool ID

1. Go back to Cognito → Federated identities
2. Click on "mindcare_identity_pool"
3. Click "Edit identity pool" (top right)
4. **IMPORTANT**: Copy the Identity Pool ID (e.g., `us-east-1:12345678-1234-1234-1234-123456789012`)

**Verification**:
- ✅ Identity pool "mindcare_identity_pool" created
- ✅ Identity Pool ID copied
- ✅ Authenticated role has S3 permissions

---


### SERVICE 5: AWS Secrets Manager

**Purpose**: Securely store database credentials and API keys

**Estimated Time**: 10 minutes

**Region**: us-east-1

#### Step 5.1: Create Database Credentials Secret

1. Go to AWS Console → Search "Secrets Manager" → Click "AWS Secrets Manager"
2. Click "Store a new secret" (orange button)
3. **Secret type**:
   - Select "Other type of secret"
4. **Key/value pairs**:
   - Click "Plaintext" tab
   - Paste this JSON (replace with your actual values):
```json
{
  "host": "your-database-host.rds.amazonaws.com",
  "port": 3306,
  "username": "admin",
  "password": "YourSecurePassword123!",
  "database": "mindcare"
}
```
5. **Encryption key**:
   - Select "aws/secretsmanager" (default)
6. Click "Next"

#### Step 5.2: Configure Secret

1. **Secret name**: `mindcare/database/credentials`
2. **Description**: "MindCare database connection credentials"
3. **Tags** (optional):
   - Key: `Project`, Value: `MindCare`
   - Key: `Environment`, Value: `Production`
4. Click "Next"

#### Step 5.3: Configure Rotation (Optional)

1. **Automatic rotation**: Disable for now (can enable later)
2. Click "Next"

#### Step 5.4: Review and Store

1. Review all settings
2. Click "Store"
3. **IMPORTANT**: Copy the Secret ARN (you'll need it)

#### Step 5.5: Create App Secrets

1. Secrets Manager → "Store a new secret"
2. **Secret type**: "Other type of secret"
3. **Key/value pairs** (Plaintext):
```json
{
  "jwt_secret": "your-random-jwt-secret-key-here-min-32-chars",
  "api_key": "your-api-key-if-needed"
}
```
4. **Secret name**: `mindcare/app-secrets`
5. Click "Next" → "Next" → "Store"

**Verification**:
- ✅ Secret "mindcare/database/credentials" created
- ✅ Secret "mindcare/app-secrets" created
- ✅ Secret ARNs copied

---

### SERVICE 6: Amazon Aurora MySQL Serverless

**Purpose**: Scalable database for application data

**Estimated Time**: 20 minutes

**Region**: us-east-1

#### Step 6.1: Create Database Subnet Group

1. Go to AWS Console → Search "RDS" → Click "RDS"
2. Left sidebar → "Subnet groups"
3. Click "Create DB subnet group"
4. **Subnet group details**:
   - Name: `mindcare-db-subnet-group`
   - Description: "Subnet group for MindCare database"
   - VPC: Select your default VPC
5. **Add subnets**:
   - Availability Zones: Select at least 2 AZs (e.g., us-east-1a, us-east-1b)
   - Subnets: Select subnets in those AZs
6. Click "Create"

#### Step 6.2: Create Security Group

1. Go to EC2 Console → Left sidebar → "Security Groups"
2. Click "Create security group"
3. **Basic details**:
   - Security group name: `mindcare-db-sg`
   - Description: "Security group for MindCare database"
   - VPC: Select your default VPC
4. **Inbound rules**:
   - Click "Add rule"
   - Type: "MySQL/Aurora"
   - Port: 3306
   - Source: "Custom" → Select Lambda security group (or 0.0.0.0/0 for testing)
5. **Outbound rules**: Leave default (all traffic)
6. Click "Create security group"

#### Step 6.3: Create Aurora Serverless v2 Cluster

1. RDS Console → Click "Create database"
2. **Engine options**:
   - Engine type: "Aurora (MySQL Compatible)"
   - Edition: "Aurora (MySQL 8.0.mysql_aurora.3.04.0)"
   - Engine version: Latest available
3. **Templates**:
   - Select "Production" (or "Dev/Test" for lower cost)
4. **Settings**:
   - DB cluster identifier: `mindcare-aurora-cluster`
   - Master username: `admin`
   - Master password: Create a strong password (save it!)
   - Confirm password
5. **Instance configuration**:
   - DB instance class: "Serverless v2"
   - Minimum ACUs: 0.5
   - Maximum ACUs: 2 (adjust based on needs)
6. **Availability & durability**:
   - Multi-AZ deployment: ✅ "Create an Aurora Replica in a different AZ"
7. **Connectivity**:
   - VPC: Default VPC
   - DB subnet group: `mindcare-db-subnet-group`
   - Public access: "No" (recommended)
   - VPC security group: Select `mindcare-db-sg`
8. **Database authentication**:
   - Database authentication options: "Password authentication"
9. **Additional configuration**:
   - Initial database name: `mindcare`
   - DB cluster parameter group: default
   - Backup retention period: 7 days
   - Enable encryption: ✅ Yes
   - Encryption key: (default) aws/rds
   - Enable Performance Insights: ✅ Yes (optional)
   - Monitoring: Enhanced monitoring (optional)
10. Click "Create database"

**Wait**: Database creation takes 10-15 minutes

#### Step 6.4: Get Database Endpoint

1. RDS Console → "Databases"
2. Click on "mindcare-aurora-cluster"
3. **IMPORTANT**: Copy these values:
   - Writer endpoint (e.g., `mindcare-aurora-cluster.cluster-xxx.us-east-1.rds.amazonaws.com`)
   - Reader endpoint (optional, for read replicas)
   - Port: 3306

#### Step 6.5: Update Secrets Manager with Database Endpoint

1. Go to Secrets Manager
2. Click on "mindcare/database/credentials"
3. Click "Retrieve secret value"
4. Click "Edit"
5. Update the "host" value with your Writer endpoint
6. Click "Save"

**Verification**:
- ✅ Aurora cluster "mindcare-aurora-cluster" created
- ✅ Database endpoint copied
- ✅ Secrets Manager updated with endpoint
- ✅ Security group allows MySQL access

---

### SERVICE 7: AWS Lambda Functions

**Purpose**: Serverless backend functions for auth, chat, and voice

**Estimated Time**: 30 minutes

**Region**: us-east-1

#### Step 7.1: Prepare Lambda Deployment Packages

**On your local machine**:

```bash
# Navigate to lambda-functions directory
cd lambda-functions

# Install dependencies
npm install

# Create deployment package for auth-handler
zip -r auth-handler.zip auth-handler.js node_modules/ package.json

# Create deployment package for chat-handler
zip -r chat-handler.zip chat-handler.js node_modules/ package.json

# Create deployment package for voice-handler
zip -r voice-handler.zip voice-handler.js node_modules/ package.json
```

#### Step 7.2: Create Auth Handler Lambda

1. Go to AWS Console → Search "Lambda" → Click "Lambda"
2. Click "Create function" (orange button)
3. **Function options**:
   - Select "Author from scratch"
4. **Basic information**:
   - Function name: `mindcare-auth-handler`
   - Runtime: "Node.js 20.x"
   - Architecture: "x86_64"
5. **Permissions**:
   - Execution role: "Use an existing role"
   - Existing role: Select "MindCare-Lambda-Execution-Role"
6. Click "Create function"

#### Step 7.3: Upload Auth Handler Code

1. In the function page, scroll to "Code source"
2. Click "Upload from" → ".zip file"
3. Click "Upload"
4. Select `auth-handler.zip`
5. Click "Save"

#### Step 7.4: Configure Auth Handler

1. Click "Configuration" tab
2. Click "General configuration" → "Edit"
   - Memory: 512 MB
   - Timeout: 30 seconds
   - Click "Save"
3. Click "Environment variables" → "Edit"
   - Add these variables:
     - `AWS_REGION`: `us-east-1`
     - `COGNITO_USER_POOL_ID`: Your User Pool ID
   - Click "Save"

#### Step 7.5: Create Chat Handler Lambda

1. Lambda Console → "Create function"
2. **Basic information**:
   - Function name: `mindcare-chat-handler`
   - Runtime: "Node.js 20.x"
   - Execution role: "MindCare-Lambda-Execution-Role"
3. Click "Create function"
4. Upload `chat-handler.zip`
5. **Configuration**:
   - Memory: 1024 MB
   - Timeout: 60 seconds
6. **Environment variables**:
   - `AWS_REGION`: `us-east-1`
   - `BEDROCK_MODEL_ID`: `anthropic.claude-3-sonnet-20240229-v1:0`
   - `DB_HOST`: Your Aurora endpoint
   - `DB_PORT`: `3306`
   - `DB_USER`: `admin`
   - `DB_PASSWORD`: Your database password
   - `DB_NAME`: `mindcare`

#### Step 7.6: Create Voice Handler Lambda

1. Lambda Console → "Create function"
2. **Basic information**:
   - Function name: `mindcare-voice-handler`
   - Runtime: "Node.js 20.x"
   - Execution role: "MindCare-Lambda-Execution-Role"
3. Click "Create function"
4. Upload `voice-handler.zip`
5. **Configuration**:
   - Memory: 1024 MB
   - Timeout: 300 seconds (5 minutes)
6. **Environment variables**:
   - `AWS_REGION`: `us-east-1`
   - `S3_AUDIO_BUCKET`: `mindcare-audio-uploads-495124020251`
   - `TRANSCRIBE_LANGUAGE_CODE`: `en-US`

#### Step 7.7: Test Lambda Functions

**Test Auth Handler**:
1. Click on `mindcare-auth-handler`
2. Click "Test" tab
3. Event name: `test-validate`
4. Event JSON:
```json
{
  "httpMethod": "POST",
  "path": "/auth/validate",
  "body": "{\"token\":\"test-token\"}"
}
```
5. Click "Test"
6. Check response (should return validation result)

**Verification**:
- ✅ mindcare-auth-handler created and tested
- ✅ mindcare-chat-handler created
- ✅ mindcare-voice-handler created
- ✅ All functions have correct environment variables
- ✅ Copy all Lambda ARNs (you'll need them)

---

### SERVICE 8: Amazon API Gateway

**Purpose**: REST API to expose Lambda functions

**Estimated Time**: 20 minutes

**Region**: us-east-1

#### Step 8.1: Create REST API

1. Go to AWS Console → Search "API Gateway" → Click "API Gateway"
2. Click "Create API"
3. **Choose API type**:
   - Select "REST API" (not Private or HTTP API)
   - Click "Build"
4. **Create new API**:
   - Select "New API"
   - API name: `MindCare-API`
   - Description: "REST API for MindCare platform"
   - Endpoint Type: "Regional"
5. Click "Create API"

#### Step 8.2: Create Cognito Authorizer

1. In API Gateway console, left sidebar → "Authorizers"
2. Click "Create New Authorizer"
3. **Authorizer settings**:
   - Name: `CognitoAuthorizer`
   - Type: "Cognito"
   - Cognito User Pool: Select "mindcare-users"
   - Token Source: `Authorization`
   - Token Validation: (leave blank)
4. Click "Create"

#### Step 8.3: Create Resources and Methods

**Create /auth resource**:
1. Left sidebar → "Resources"
2. Click "Actions" → "Create Resource"
3. Resource Name: `auth`
4. Resource Path: `auth`
5. ✅ Enable API Gateway CORS
6. Click "Create Resource"

**Create /auth/validate endpoint**:
1. Select `/auth` resource
2. Click "Actions" → "Create Resource"
3. Resource Name: `validate`
4. Click "Create Resource"
5. Select `/auth/validate` resource
6. Click "Actions" → "Create Method" → Select "POST" → Click checkmark
7. **Setup**:
   - Integration type: "Lambda Function"
   - Use Lambda Proxy integration: ✅ Yes
   - Lambda Region: us-east-1
   - Lambda Function: `mindcare-auth-handler`
   - Click "Save"
   - Click "OK" to grant permissions

**Create /auth/user endpoint**:
1. Select `/auth` resource
2. Click "Actions" → "Create Resource"
3. Resource Name: `user`
4. Click "Create Resource"
5. Select `/auth/user` resource
6. Create methods: GET, PUT, DELETE (repeat for each):
   - Click "Actions" → "Create Method" → Select method → Checkmark
   - Integration: Lambda Proxy → `mindcare-auth-handler`
   - Click "Save"
7. For each method:
   - Click "Method Request"
   - Authorization: Select "CognitoAuthorizer"
   - Click checkmark

**Create /chat resource and endpoints**:
1. Click "Actions" → "Create Resource"
2. Resource Name: `chat`, Enable CORS
3. Create `/chat/send` (POST), `/chat/history` (GET), `/chat/clear` (DELETE)
4. All methods:
   - Integration: Lambda Proxy → `mindcare-chat-handler`
   - Authorization: CognitoAuthorizer

**Create /voice resource and endpoints**:
1. Create Resource: `voice`, Enable CORS
2. Create `/voice/transcribe` (POST), `/voice/transcribe/status` (GET), `/voice/synthesize` (POST)
3. All methods:
   - Integration: Lambda Proxy → `mindcare-voice-handler`
   - Authorization: CognitoAuthorizer

#### Step 8.4: Enable CORS

1. For each resource (/auth, /auth/validate, /auth/user, /chat, /chat/send, etc.):
   - Select the resource
   - Click "Actions" → "Enable CORS"
   - Access-Control-Allow-Origin: `*` (or specific domains)
   - Click "Enable CORS and replace existing CORS headers"
   - Click "Yes, replace existing values"

#### Step 8.5: Deploy API

1. Click "Actions" → "Deploy API"
2. **Deployment stage**: [New Stage]
3. Stage name: `prod`
4. Stage description: "Production stage"
5. Click "Deploy"
6. **IMPORTANT**: Copy the "Invoke URL" (e.g., `https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod`)

**Verification**:
- ✅ API "MindCare-API" created
- ✅ Cognito authorizer configured
- ✅ All endpoints created and linked to Lambda
- ✅ CORS enabled
- ✅ API deployed to prod stage
- ✅ Invoke URL copied

---


### SERVICE 9: Amazon Bedrock Model Access

**Purpose**: Enable access to Claude 3 Sonnet AI model

**Estimated Time**: 5 minutes

**Region**: us-east-1

#### Step 9.1: Request Model Access

1. Go to AWS Console → Search "Bedrock" → Click "Amazon Bedrock"
2. Left sidebar → Click "Model access"
3. Click "Manage model access" (orange button, top right)
4. **Available models**:
   - Scroll to find "Anthropic"
   - Find "Claude 3 Sonnet"
   - ✅ Check the box next to "Claude 3 Sonnet"
5. Click "Request model access" (bottom right)
6. **Wait**: Access is usually granted instantly (check status)

#### Step 9.2: Verify Model Access

1. Bedrock Console → "Model access"
2. Check that "Claude 3 Sonnet" shows "Access granted" (green checkmark)
3. **Model ID**: `anthropic.claude-3-sonnet-20240229-v1:0`

**Verification**:
- ✅ Claude 3 Sonnet access granted
- ✅ Model ID confirmed

---

### SERVICE 10: Amazon CloudWatch

**Purpose**: Logging and monitoring

**Estimated Time**: 10 minutes

**Region**: us-east-1

#### Step 10.1: Create Log Groups

1. Go to AWS Console → Search "CloudWatch" → Click "CloudWatch"
2. Left sidebar → "Logs" → "Log groups"
3. Click "Create log group"
4. **Log group name**: `/mindcare/frontend`
5. **Retention setting**: 7 days (or as needed)
6. Click "Create"
7. Repeat for:
   - `/mindcare/backend`
   - `/aws/lambda/mindcare-auth-handler` (auto-created by Lambda)
   - `/aws/lambda/mindcare-chat-handler` (auto-created by Lambda)
   - `/aws/lambda/mindcare-voice-handler` (auto-created by Lambda)

#### Step 10.2: Create Dashboard

1. Left sidebar → "Dashboards"
2. Click "Create dashboard"
3. Dashboard name: `MindCare-Dashboard`
4. Click "Create dashboard"
5. **Add widgets**:
   - Click "Add widget"
   - Select "Line" → "Metrics"
   - Select "Lambda" → "By Function Name"
   - Select metrics for all 3 Lambda functions:
     - Invocations
     - Errors
     - Duration
   - Click "Create widget"
6. Add more widgets as needed (API Gateway requests, S3 operations, etc.)
7. Click "Save dashboard"

#### Step 10.3: Create Alarms

**Lambda Error Alarm**:
1. Left sidebar → "Alarms" → "All alarms"
2. Click "Create alarm"
3. Click "Select metric"
4. Select "Lambda" → "By Function Name"
5. Select "Errors" for `mindcare-chat-handler`
6. Click "Select metric"
7. **Conditions**:
   - Threshold type: Static
   - Whenever Errors is: Greater than 10
   - Datapoints: 1 out of 1
8. Click "Next"
9. **Notification**:
   - Create new topic: `MindCare-Alerts`
   - Email: your-email@example.com
   - Click "Create topic"
10. Click "Next"
11. Alarm name: `MindCare-Lambda-Errors`
12. Click "Next" → "Create alarm"
13. **Check email** and confirm SNS subscription

**Verification**:
- ✅ Log groups created
- ✅ Dashboard created
- ✅ Alarms configured
- ✅ SNS topic subscribed

---

### SERVICE 11: Amazon CloudFront

**Purpose**: CDN for fast content delivery

**Estimated Time**: 15 minutes

**Region**: Global (managed from us-east-1)

**Note**: CloudFront setup is typically done after Amplify deployment. For now, we'll prepare the configuration.

#### Step 11.1: Create CloudFront Distribution (After Amplify)

1. Go to AWS Console → Search "CloudFront" → Click "CloudFront"
2. Click "Create distribution"
3. **Origin settings**:
   - Origin domain: Your Amplify domain (e.g., `main.d1234567890.amplifyapp.com`)
   - Protocol: HTTPS only
   - Name: `AmplifyOrigin`
4. **Default cache behavior**:
   - Viewer protocol policy: "Redirect HTTP to HTTPS"
   - Allowed HTTP methods: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
   - Cache policy: "CachingOptimized"
   - Origin request policy: "AllViewer"
5. **Settings**:
   - Price class: "Use all edge locations (best performance)"
   - Alternate domain names (CNAMEs): your-domain.com (if you have one)
   - Custom SSL certificate: (select if you have ACM certificate)
   - Default root object: `index.html`
6. Click "Create distribution"

**Wait**: Distribution deployment takes 10-15 minutes

#### Step 11.2: Configure Custom Error Responses (for SPA)

1. Click on your distribution
2. Click "Error pages" tab
3. Click "Create custom error response"
4. **Error response 1**:
   - HTTP error code: 403
   - Customize error response: Yes
   - Response page path: `/index.html`
   - HTTP response code: 200
   - Click "Create"
5. **Error response 2**:
   - HTTP error code: 404
   - Response page path: `/index.html`
   - HTTP response code: 200
   - Click "Create"

**Verification**:
- ✅ CloudFront distribution created
- ✅ Custom error responses configured
- ✅ Distribution domain name copied

---

### SERVICE 12: AWS Amplify

**Purpose**: Frontend hosting with CI/CD

**Estimated Time**: 20 minutes

**Region**: us-east-1

#### Step 12.1: Prepare Frontend for Deployment

**On your local machine**:

1. Update `.env` with all AWS resource IDs:
```bash
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=AKIAXGR5Q7QN6N6LFHTF
VITE_AWS_SECRET_ACCESS_KEY=fW4EugBT9dbHTHVVzHKgGdD5tBWowy8G12brY2hH
VITE_AWS_ACCOUNT_ID=495124020251
VITE_COGNITO_USER_POOL_ID=<YOUR_USER_POOL_ID>
VITE_COGNITO_CLIENT_ID=<YOUR_CLIENT_ID>
VITE_COGNITO_IDENTITY_POOL_ID=<YOUR_IDENTITY_POOL_ID>
VITE_S3_AUDIO_BUCKET=mindcare-audio-uploads-495124020251
VITE_S3_USER_CONTENT_BUCKET=mindcare-user-content-495124020251
VITE_BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
VITE_TRANSCRIBE_LANGUAGE_CODE=en-US
VITE_POLLY_VOICE_ID=Joanna
VITE_API_GATEWAY_URL=<YOUR_API_GATEWAY_URL>
VITE_SECRETS_MANAGER_SECRET_NAME=mindcare/app-secrets
VITE_CLOUDWATCH_LOG_GROUP=/mindcare/frontend
```

2. Test build locally:
```bash
npm run build
```

3. Commit and push to GitHub (if using Git):
```bash
git add .
git commit -m "Configure AWS resources"
git push origin main
```

#### Step 12.2: Create Amplify App

1. Go to AWS Console → Search "Amplify" → Click "AWS Amplify"
2. Click "Get started" under "Amplify Hosting"
3. **Get started with Amplify Hosting**:
   - Select "Deploy without Git provider" (or connect GitHub if you have repo)
   - Click "Continue"

**Option A: Manual Deployment**:
1. App name: `MindCare`
2. Environment name: `production`
3. Drag and drop your `dist` folder (after running `npm run build`)
4. Click "Save and deploy"

**Option B: GitHub Deployment** (Recommended):
1. Select "GitHub"
2. Click "Continue"
3. Authorize AWS Amplify to access GitHub
4. Select repository: `your-username/mindcare`
5. Select branch: `main`
6. Click "Next"
7. **Build settings**:
   - Build command: `npm run build`
   - Base directory: (leave empty)
   - Build output directory: `dist`
8. **Environment variables**:
   - Add all VITE_* variables from your .env
9. Click "Next"
10. Review and click "Save and deploy"

**Wait**: First deployment takes 5-10 minutes

#### Step 12.3: Configure Custom Domain (Optional)

1. Click on your app in Amplify Console
2. Left sidebar → "Domain management"
3. Click "Add domain"
4. Enter your domain: `mindcare.com`
5. Follow DNS configuration instructions
6. Click "Save"

#### Step 12.4: Get Amplify URL

1. Amplify Console → Click on your app
2. **IMPORTANT**: Copy the Amplify URL (e.g., `https://main.d1234567890.amplifyapp.com`)

**Verification**:
- ✅ Amplify app created
- ✅ Frontend deployed successfully
- ✅ Amplify URL copied
- ✅ App accessible in browser

---

## Environment Configuration

### Frontend .env File

Create/update `.env` in project root:

```bash
# AWS Configuration
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=AKIAXGR5Q7QN6N6LFHTF
VITE_AWS_SECRET_ACCESS_KEY=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
VITE_AWS_ACCOUNT_ID=495124020251

# Cognito (UPDATE THESE)
VITE_COGNITO_USER_POOL_ID=us-east-1_ABC123XYZ
VITE_COGNITO_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j
VITE_COGNITO_IDENTITY_POOL_ID=us-east-1:12345678-1234-1234-1234-123456789012

# S3
VITE_S3_AUDIO_BUCKET=mindcare-audio-uploads-495124020251
VITE_S3_USER_CONTENT_BUCKET=mindcare-user-content-495124020251

# Bedrock
VITE_BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0

# Transcribe
VITE_TRANSCRIBE_LANGUAGE_CODE=en-US

# Polly
VITE_POLLY_VOICE_ID=Joanna

# API Gateway (UPDATE THIS)
VITE_API_GATEWAY_URL=https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod

# Secrets Manager
VITE_SECRETS_MANAGER_SECRET_NAME=mindcare/app-secrets

# CloudWatch
VITE_CLOUDWATCH_LOG_GROUP=/mindcare/frontend
```

### Database Migration

Run the database schema:

```bash
# Connect to Aurora database
mysql -h mindcare-aurora-cluster.cluster-xxx.us-east-1.rds.amazonaws.com -u admin -p

# Enter password when prompted

# Run migrations
source server/db/migrations.sql

# Verify tables created
SHOW TABLES;

# Exit
EXIT;
```

---

## Testing & Verification

### Test 1: Authentication Flow

1. Open your Amplify URL in browser
2. Click "Sign Up"
3. Enter email and password
4. Check email for verification code
5. Enter verification code
6. Sign in with credentials
7. **Expected**: Successfully signed in, JWT token received

### Test 2: AI Chat

1. After signing in, navigate to Chat page
2. Send a message: "Hello, how are you?"
3. **Expected**: AI responds with mental health support message

### Test 3: Voice Transcription

1. Navigate to Voice page
2. Record or upload an audio file
3. Click "Transcribe"
4. **Expected**: Transcription appears after processing

### Test 4: Text-to-Speech

1. Navigate to Voice page
2. Enter text: "Hello, this is a test"
3. Click "Generate Speech"
4. **Expected**: Audio plays with synthesized speech

### Test 5: File Upload

1. Navigate to Profile page
2. Upload a profile picture
3. **Expected**: Image uploads to S3 and displays

### Test 6: CloudWatch Logs

1. Go to CloudWatch Console
2. Check log groups for Lambda functions
3. **Expected**: Logs appear for each API call

---

## Troubleshooting

### Issue: Cognito Sign Up Fails

**Symptoms**: "User pool does not exist" error

**Solutions**:
1. Verify User Pool ID in .env is correct
2. Check region is us-east-1
3. Verify Cognito User Pool exists in AWS Console
4. Check IAM permissions for Cognito

### Issue: API Gateway Returns 403

**Symptoms**: "Missing Authentication Token" or "Forbidden"

**Solutions**:
1. Verify Cognito authorizer is configured
2. Check JWT token is being sent in Authorization header
3. Verify Lambda has correct permissions
4. Check API Gateway CORS configuration
5. Redeploy API Gateway

### Issue: Bedrock Returns 403

**Symptoms**: "Access Denied" when calling Bedrock

**Solutions**:
1. Verify Bedrock model access is granted
2. Check Lambda IAM role has bedrock:InvokeModel permission
3. Verify model ID is correct
4. Check region is us-east-1

### Issue: Lambda Timeout

**Symptoms**: "Task timed out after X seconds"

**Solutions**:
1. Increase Lambda timeout (Configuration → General → Timeout)
2. Optimize Lambda code
3. Check database connection is not hanging
4. Verify network connectivity

### Issue: S3 Upload Fails

**Symptoms**: "Access Denied" or CORS error

**Solutions**:
1. Verify S3 bucket CORS configuration
2. Check IAM permissions for S3
3. Verify bucket name in .env is correct
4. Check bucket exists in us-east-1

### Issue: Database Connection Fails

**Symptoms**: "ECONNREFUSED" or "Access denied"

**Solutions**:
1. Verify Aurora endpoint in environment variables
2. Check security group allows Lambda access
3. Verify database credentials in Secrets Manager
4. Check database is running (not paused)
5. Verify Lambda is in same VPC as database (if using VPC)

---

## Cost Optimization Tips

1. **Enable S3 Lifecycle Policies**: Delete old audio files after 30 days
2. **Use Aurora Serverless v2**: Auto-scales based on usage
3. **Set Lambda Reserved Concurrency**: Prevent runaway costs
4. **Enable CloudWatch Log Retention**: Delete old logs after 7 days
5. **Use CloudFront Caching**: Reduce origin requests
6. **Monitor with Cost Explorer**: Set up budget alerts
7. **Use Free Tier**: Cognito, Lambda, API Gateway have generous free tiers

---

## Security Best Practices

1. **Rotate AWS Credentials**: Create new access keys, delete old ones
2. **Enable MFA**: On root account and IAM users
3. **Use Secrets Manager**: Never hardcode credentials
4. **Enable CloudTrail**: Audit all API calls
5. **Configure WAF**: Protect API Gateway from attacks
6. **Use HTTPS Only**: Enforce TLS 1.2+
7. **Implement Rate Limiting**: Prevent abuse
8. **Regular Security Audits**: Use AWS Security Hub

---

## Next Steps

1. ✅ All AWS resources created
2. ✅ Environment variables configured
3. ✅ Database migrated
4. ✅ Application tested
5. ⏳ Set up monitoring and alerts
6. ⏳ Configure custom domain
7. ⏳ Implement CI/CD pipeline
8. ⏳ Load testing
9. ⏳ Security hardening
10. ⏳ Production launch

---

## Summary

**Total Setup Time**: 2-4 hours

**Services Configured**: 14 AWS services

**Estimated Monthly Cost**: $20-50 (development), $190-485 (production with 1000 users)

**Status**: ✅ Ready for production deployment

---

**Last Updated**: 2024
**Region**: us-east-1 (US East - N. Virginia)
**Version**: 1.0
