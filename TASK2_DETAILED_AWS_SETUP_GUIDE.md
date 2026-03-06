# TASK 2: Detailed AWS Setup Guide - Step by Step

## 📋 Table of Contents
1. AWS Account Setup
2. IAM User Creation
3. Amazon Cognito Setup
4. Amazon S3 Setup
5. Amazon Bedrock Setup
6. AWS Lambda Setup
7. Amazon API Gateway Setup
8. Aurora MySQL Setup
9. CloudWatch Setup
10. CloudFront Setup
11. Environment Configuration
12. Testing & Verification

---

## ⚙️ Prerequisites

- AWS Account (with billing enabled)
- Credit card for AWS billing
- Email address for verification
- Your AWS credentials:
  - Access Key ID: `AKIAXGR5Q7QN6N6LFHTF`
  - Secret Access Key: `fW4EugBT9dbHTHVVzHKgGdD5tBWowy8G12brY2hH`
  - Account ID: `495124020251`

---

## 🌍 IMPORTANT: AWS Region Selection

**PRIMARY REGION: us-east-1 (US East - N. Virginia)**

Use `us-east-1` for ALL services unless specified otherwise.

**Why us-east-1?**
- Lowest cost
- All AWS services available
- Best for global applications
- Your credentials are configured for this region

---

## STEP 1: AWS Account Setup & IAM User

### 1.1 Login to AWS Console

1. Go to: https://console.aws.amazon.com
2. Click "Sign in to the Console"
3. Enter your root email: `dhruv.batttawar@vit.edu`
4. Enter your password: `M2KV2nA$wZ~}$6#`
5. Click "Sign in"

### 1.2 Verify Your Region

1. Look at the top-right corner of AWS Console
2. Click on the region dropdown
3. Select **"US East (N. Virginia) us-east-1"**
4. All subsequent steps will use this region

### 1.3 Enable MFA (Multi-Factor Authentication) - RECOMMENDED

1. Click your account name (top-right)
2. Click "Security credentials"
3. Scroll to "Multi-factor authentication (MFA)"
4. Click "Assign MFA device"
5. Choose "Virtual MFA device"
6. Use Google Authenticator or Authy app
7. Scan QR code
8. Enter two consecutive MFA codes
9. Click "Assign MFA"

### 1.4 Verify IAM User (Already Created)

Your IAM user is already created:
- Username: `dhruv`
- Password: `Mindcare@8032026`
- Access Key ID: `AKIAXGR5Q7QN6N6LFHTF`
- Secret Access Key: `fW4EugBT9dbHTHVVzHKgGdD5tBWowy8G12brY2hH`

**Verify permissions:**
1. Go to IAM Console: https://console.aws.amazon.com/iam
2. Click "Users" in left sidebar
3. Click "dhruv"
4. Click "Permissions" tab
5. Verify you have "AdministratorAccess" policy attached

---

## STEP 2: Amazon Cognito Setup (Authentication)

### 2.1 Create Cognito User Pool

1. Go to Cognito Console: https://console.aws.amazon.com/cognito
2. **Region**: Verify you're in **us-east-1**
3. Click "Create user pool"

### 2.2 Configure Sign-in Experience

**Step 1: Configure sign-in experience**
1. **Provider types**: Select "Cognito user pool"
2. **Cognito user pool sign-in options**: Check ☑ "Email"
3. **User name requirements**: Leave default
4. Click "Next"

### 2.3 Configure Security Requirements

**Step 2: Configure security requirements**

**Password policy:**
- Select "Cognito defaults"
- Minimum length: 8 characters
- ☑ Require lowercase letters
- ☑ Require uppercase letters
- ☑ Require numbers
- ☑ Require special characters

**Multi-factor authentication:**
- Select "No MFA" (for development)
- For production, select "Optional MFA"

**User account recovery:**
- ☑ Enable self-service account recovery
- Select "Email only"

Click "Next"

### 2.4 Configure Sign-up Experience

**Step 3: Configure sign-up experience**

**Self-service sign-up:**
- ☑ Enable self-registration

**Attribute verification and user account confirmation:**
- ☑ Allow Cognito to automatically send messages to verify and confirm
- Select "Send email message, verify email address"

**Required attributes:**
- ☑ email (already selected)
- ☑ name

**Custom attributes:**
1. Click "Add custom attribute"
2. Name: `role`
3. Type: String
4. Min length: 1
5. Max length: 20
6. Mutable: Yes
7. Click "Add attribute"

Click "Next"

### 2.5 Configure Message Delivery

**Step 4: Configure message delivery**

**Email:**
- Select "Send email with Cognito"
- FROM email address: `no-reply@verificationemail.com` (default)
- Reply-to email address: Leave empty

Click "Next"

### 2.6 Integrate Your App

**Step 5: Integrate your app**

**User pool name:**
- Enter: `mindcare-users`

**Hosted authentication pages:**
- ☐ Don't use Cognito Hosted UI (uncheck)

**Initial app client:**
- App type: "Public client"
- App client name: `mindcare-web-client`
- Client secret: "Don't generate a client secret"

**Advanced app client settings:**
- Authentication flows:
  - ☑ ALLOW_USER_SRP_AUTH
  - ☑ ALLOW_REFRESH_TOKEN_AUTH
  - ☐ ALLOW_USER_PASSWORD_AUTH (uncheck for security)

Click "Next"

### 2.7 Review and Create

**Step 6: Review and create**
1. Review all settings
2. Click "Create user pool"
3. Wait for creation (30 seconds)

### 2.8 Note Down User Pool Details

After creation, you'll see:
1. **User pool ID**: Copy this (format: `us-east-1_XXXXXXXXX`)
   - Example: `us-east-1_AbC123XyZ`
2. Click on the user pool name "mindcare-users"
3. Click "App integration" tab
4. Scroll to "App clients and analytics"
5. Click on "mindcare-web-client"
6. **Client ID**: Copy this (format: `1a2b3c4d5e6f7g8h9i0j1k2l3m`)

**Save these values - you'll need them later!**

### 2.9 Create Cognito Identity Pool

1. Go back to Cognito Console
2. Click "Identity pools" in left sidebar
3. Click "Create identity pool"
4. **Identity pool name**: `mindcare_identity_pool`
5. **Enable access to unauthenticated identities**: ☐ No
6. **Authentication providers**:
   - Expand "Amazon Cognito user pool"
   - User pool ID: Paste your User Pool ID
   - App client ID: Paste your Client ID
7. Click "Create pool"
8. **Note down Identity Pool ID** (format: `us-east-1:12345678-1234-1234-1234-123456789012`)

### 2.10 Create User Groups

1. Go to your User Pool "mindcare-users"
2. Click "Groups" tab
3. Click "Create group"

**Group 1: Users**
- Group name: `user`
- Description: `Regular users`
- Precedence: `3`
- Click "Create group"

**Group 2: Counsellors**
- Group name: `counsellor`
- Description: `Mental health counsellors`
- Precedence: `2`
- Click "Create group"

**Group 3: Admins**
- Group name: `admin`
- Description: `System administrators`
- Precedence: `1`
- Click "Create group"

✅ **Cognito Setup Complete!**

---

## STEP 3: Amazon S3 Setup (File Storage)

### 3.1 Create S3 Bucket #1 (Audio Uploads)

1. Go to S3 Console: https://console.aws.amazon.com/s3
2. **Region**: Verify you're in **us-east-1**
3. Click "Create bucket"

**Bucket settings:**
- **Bucket name**: `mindcare-audio-uploads` (must be globally unique)
  - If taken, try: `mindcare-audio-uploads-495124020251`
- **AWS Region**: US East (N. Virginia) us-east-1
- **Object Ownership**: ACLs disabled (recommended)
- **Block Public Access settings**: Keep all checked ☑ (block all public access)
- **Bucket Versioning**: Disable
- **Default encryption**: 
  - Encryption type: Server-side encryption with Amazon S3 managed keys (SSE-S3)
- Click "Create bucket"

### 3.2 Configure CORS for Audio Bucket

1. Click on bucket name "mindcare-audio-uploads"
2. Click "Permissions" tab
3. Scroll to "Cross-origin resource sharing (CORS)"
4. Click "Edit"
5. Paste this JSON:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "http://localhost:5173",
            "http://localhost:3000",
            "https://*.amplifyapp.com",
            "https://mindcare.com"
        ],
        "ExposeHeaders": [
            "ETag",
            "x-amz-server-side-encryption",
            "x-amz-request-id",
            "x-amz-id-2"
        ],
        "MaxAgeSeconds": 3600
    }
]
```

6. Click "Save changes"

### 3.3 Create S3 Bucket #2 (User Content)

1. Go back to S3 Console
2. Click "Create bucket"

**Bucket settings:**
- **Bucket name**: `mindcare-user-content`
  - If taken, try: `mindcare-user-content-495124020251`
- **AWS Region**: US East (N. Virginia) us-east-1
- **Object Ownership**: ACLs disabled (recommended)
- **Block Public Access settings**: Keep all checked ☑
- **Bucket Versioning**: Disable
- **Default encryption**: SSE-S3
- Click "Create bucket"

### 3.4 Configure CORS for User Content Bucket

1. Click on bucket name "mindcare-user-content"
2. Click "Permissions" tab
3. Scroll to "Cross-origin resource sharing (CORS)"
4. Click "Edit"
5. Paste the same JSON as above
6. Click "Save changes"

### 3.5 Create Lifecycle Policy (Optional - Cost Savings)

**For audio-uploads bucket (auto-delete old files):**
1. Click on "mindcare-audio-uploads"
2. Click "Management" tab
3. Click "Create lifecycle rule"
4. **Rule name**: `delete-old-audio`
5. **Rule scope**: Apply to all objects
6. **Lifecycle rule actions**: ☑ Expire current versions of objects
7. **Days after object creation**: `90` (delete after 90 days)
8. Click "Create rule"

✅ **S3 Setup Complete!**

**Note down your bucket names:**
- Audio bucket: `mindcare-audio-uploads` (or your unique name)
- User content bucket: `mindcare-user-content` (or your unique name)

---

## STEP 4: Amazon Bedrock Setup (AI - Claude)

### 4.1 Enable Bedrock Model Access

1. Go to Bedrock Console: https://console.aws.amazon.com/bedrock
2. **Region**: Verify you're in **us-east-1**
3. In left sidebar, click "Model access"
4. Click "Manage model access" (orange button)

### 4.2 Request Access to Claude 3 Sonnet

1. Find "Anthropic" section
2. Find "Claude 3 Sonnet" model
3. Check the box ☑ next to "Claude 3 Sonnet"
4. Scroll down and click "Request model access"
5. Wait for approval (usually instant, max 5 minutes)

### 4.3 Verify Model Access

1. Go back to "Model access" page
2. Refresh the page
3. Look for "Claude 3 Sonnet"
4. Status should show "Access granted" (green)

### 4.4 Test Bedrock (Optional)

1. In left sidebar, click "Playgrounds"
2. Click "Chat"
3. Select model: "Claude 3 Sonnet"
4. Type a test message: "Hello, how are you?"
5. Click "Run"
6. You should see a response from Claude

✅ **Bedrock Setup Complete!**

**Model ID to use**: `anthropic.claude-3-sonnet-20240229-v1:0`

---

## STEP 5: AWS Lambda Setup (Serverless Functions)

### 5.1 Create IAM Role for Lambda

1. Go to IAM Console: https://console.aws.amazon.com/iam
2. Click "Roles" in left sidebar
3. Click "Create role"

**Step 1: Select trusted entity**
- Trusted entity type: AWS service
- Use case: Lambda
- Click "Next"

**Step 2: Add permissions**
Search and select these policies (check the box):
- ☑ `AWSLambdaBasicExecutionRole`
- ☑ `AmazonCognitoPowerUser`
- ☑ `AmazonBedrockFullAccess`
- ☑ `AmazonTranscribeFullAccess`
- ☑ `AmazonPollyFullAccess`
- ☑ `AmazonS3FullAccess`
- ☑ `SecretsManagerReadWrite`
- ☑ `CloudWatchLogsFullAccess`

Click "Next"

**Step 3: Name, review, and create**
- Role name: `MindCareLambdaExecutionRole`
- Description: `Execution role for MindCare Lambda functions`
- Click "Create role"

### 5.2 Prepare Lambda Deployment Packages

**On your local machine:**

```bash
# Navigate to lambda-functions directory
cd lambda-functions

# Install dependencies
npm install

# Create deployment package for auth-handler
zip -r auth-handler.zip auth-handler.js node_modules/

# Create deployment package for chat-handler
zip -r chat-handler.zip chat-handler.js node_modules/

# Create deployment package for voice-handler
zip -r voice-handler.zip voice-handler.js node_modules/
```

### 5.3 Create Lambda Function #1 (Auth Handler)

1. Go to Lambda Console: https://console.aws.amazon.com/lambda
2. **Region**: Verify you're in **us-east-1**
3. Click "Create function"

**Function settings:**
- **Function name**: `mindcare-auth-handler`
- **Runtime**: Node.js 20.x
- **Architecture**: x86_64
- **Permissions**: 
  - Execution role: "Use an existing role"
  - Existing role: `MindCareLambdaExecutionRole`
- Click "Create function"

**Upload code:**
1. In "Code" tab, click "Upload from"
2. Select ".zip file"
3. Click "Upload"
4. Select `auth-handler.zip`
5. Click "Save"

**Configure function:**
1. Click "Configuration" tab
2. Click "General configuration"
3. Click "Edit"
4. **Memory**: 512 MB
5. **Timeout**: 30 seconds
6. Click "Save"

**Add environment variables:**
1. Click "Configuration" tab
2. Click "Environment variables"
3. Click "Edit"
4. Add these variables:

| Key | Value |
|-----|-------|
| `AWS_REGION` | `us-east-1` |
| `COGNITO_USER_POOL_ID` | Your User Pool ID (from Step 2.8) |
| `COGNITO_CLIENT_ID` | Your Client ID (from Step 2.8) |

5. Click "Save"

### 5.4 Create Lambda Function #2 (Chat Handler)

1. Go back to Lambda Console
2. Click "Create function"

**Function settings:**
- **Function name**: `mindcare-chat-handler`
- **Runtime**: Node.js 20.x
- **Architecture**: x86_64
- **Permissions**: Use existing role `MindCareLambdaExecutionRole`
- Click "Create function"

**Upload code:**
1. Upload `chat-handler.zip`

**Configure function:**
1. **Memory**: 1024 MB
2. **Timeout**: 60 seconds

**Add environment variables:**

| Key | Value |
|-----|-------|
| `AWS_REGION` | `us-east-1` |
| `BEDROCK_MODEL_ID` | `anthropic.claude-3-sonnet-20240229-v1:0` |
| `DB_HOST` | Your database host (add later in Step 8) |
| `DB_PORT` | `3306` |
| `DB_USER` | Your database user (add later) |
| `DB_PASSWORD` | Your database password (add later) |
| `DB_NAME` | `mindcare` |

### 5.5 Create Lambda Function #3 (Voice Handler)

1. Go back to Lambda Console
2. Click "Create function"

**Function settings:**
- **Function name**: `mindcare-voice-handler`
- **Runtime**: Node.js 20.x
- **Architecture**: x86_64
- **Permissions**: Use existing role `MindCareLambdaExecutionRole`
- Click "Create function"

**Upload code:**
1. Upload `voice-handler.zip`

**Configure function:**
1. **Memory**: 1024 MB
2. **Timeout**: 300 seconds (5 minutes)

**Add environment variables:**

| Key | Value |
|-----|-------|
| `AWS_REGION` | `us-east-1` |
| `S3_AUDIO_BUCKET` | Your audio bucket name (from Step 3) |
| `TRANSCRIBE_LANGUAGE_CODE` | `en-US` |
| `POLLY_VOICE_ID` | `Joanna` |
| `POLLY_ENGINE` | `neural` |

✅ **Lambda Setup Complete!**

**Note down your Lambda ARNs:**
- Auth Handler ARN: `arn:aws:lambda:us-east-1:495124020251:function:mindcare-auth-handler`
- Chat Handler ARN: `arn:aws:lambda:us-east-1:495124020251:function:mindcare-chat-handler`
- Voice Handler ARN: `arn:aws:lambda:us-east-1:495124020251:function:mindcare-voice-handler`

---

## STEP 6: Amazon API Gateway Setup (REST API)

### 6.1 Create REST API

1. Go to API Gateway Console: https://console.aws.amazon.com/apigateway
2. **Region**: Verify you're in **us-east-1**
3. Click "Create API"
4. Find "REST API" (not Private)
5. Click "Build"

**API settings:**
- **Choose the protocol**: REST
- **Create new API**: New API
- **API name**: `MindCareAPI`
- **Description**: `REST API for MindCare mental health platform`
- **Endpoint Type**: Regional
- Click "Create API"

### 6.2 Create Cognito Authorizer

1. In left sidebar, click "Authorizers"
2. Click "Create authorizer"

**Authorizer settings:**
- **Name**: `CognitoAuthorizer`
- **Type**: Cognito
- **Cognito User Pool**: Select your user pool `mindcare-users`
- **Token Source**: `Authorization`
- **Token Validation**: Leave empty
- Click "Create authorizer"

### 6.3 Create Resources and Methods

**Create /auth resource:**
1. Click "Resources" in left sidebar
2. Click "Actions" → "Create Resource"
3. **Resource Name**: `auth`
4. **Resource Path**: `auth`
5. ☑ Enable API Gateway CORS
6. Click "Create Resource"

**Create /auth/validate method:**
1. Select `/auth` resource
2. Click "Actions" → "Create Method"
3. Select "POST" from dropdown
4. Click checkmark ✓

**Configure POST method:**
- **Integration type**: Lambda Function
- **Use Lambda Proxy integration**: ☑ Yes
- **Lambda Region**: us-east-1
- **Lambda Function**: `mindcare-auth-handler`
- Click "Save"
- Click "OK" to give API Gateway permission

**Create /auth/user method:**
1. Select `/auth` resource
2. Click "Actions" → "Create Method"
3. Select "GET"
4. Configure same as above (Lambda: `mindcare-auth-handler`)

**Add Authorization to GET:**
1. Click on "GET" method under `/auth`
2. Click "Method Request"
3. Click pencil icon next to "Authorization"
4. Select "CognitoAuthorizer"
5. Click checkmark ✓

**Create /chat resource:**
1. Click "/" (root)
2. Click "Actions" → "Create Resource"
3. **Resource Name**: `chat`
4. ☑ Enable API Gateway CORS
5. Click "Create Resource"

**Create /chat/send method:**
1. Select `/chat` resource
2. Click "Actions" → "Create Method"
3. Select "POST"
4. **Lambda Function**: `mindcare-chat-handler`
5. ☑ Use Lambda Proxy integration
6. Click "Save"

**Add Authorization:**
1. Click "Method Request"
2. Authorization: `CognitoAuthorizer`

**Create /voice resource:**
1. Click "/" (root)
2. Click "Actions" → "Create Resource"
3. **Resource Name**: `voice`
4. ☑ Enable API Gateway CORS
5. Click "Create Resource"

**Create /voice/transcribe method:**
1. Select `/voice` resource
2. Create "POST" method
3. **Lambda Function**: `mindcare-voice-handler`
4. Authorization: `CognitoAuthorizer`

**Create /voice/synthesize method:**
1. Select `/voice` resource
2. Create "POST" method
3. **Lambda Function**: `mindcare-voice-handler`
4. Authorization: `CognitoAuthorizer`

### 6.4 Enable CORS for All Methods

1. Select each resource (/auth, /chat, /voice)
2. Click "Actions" → "Enable CORS"
3. Keep default settings:
   - Access-Control-Allow-Headers: `Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token`
   - Access-Control-Allow-Methods: Select all
   - Access-Control-Allow-Origin: `*`
4. Click "Enable CORS and replace existing CORS headers"
5. Click "Yes, replace existing values"

### 6.5 Deploy API

1. Click "Actions" → "Deploy API"
2. **Deployment stage**: [New Stage]
3. **Stage name**: `prod`
4. **Stage description**: `Production environment`
5. Click "Deploy"

### 6.6 Note Down API Gateway URL

After deployment, you'll see:
- **Invoke URL**: `https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod`

**Copy this URL - you'll need it for environment variables!**

✅ **API Gateway Setup Complete!**

---

## STEP 7: Aurora MySQL Serverless Setup (Database)

### 7.1 Create Database Subnet Group

1. Go to RDS Console: https://console.aws.amazon.com/rds
2. **Region**: Verify you're in **us-east-1**
3. Click "Subnet groups" in left sidebar
4. Click "Create DB subnet group"

**Subnet group settings:**
- **Name**: `mindcare-db-subnet-group`
- **Description**: `Subnet group for MindCare database`
- **VPC**: Select your default VPC
- **Availability Zones**: Select at least 2 AZs (us-east-1a, us-east-1b)
- **Subnets**: Select subnets from the selected AZs
- Click "Create"

### 7.2 Create Aurora Serverless v2 Cluster

1. Go back to RDS Console
2. Click "Databases" in left sidebar
3. Click "Create database"

**Engine options:**
- **Engine type**: Aurora (MySQL Compatible)
- **Edition**: Aurora (MySQL 8.0)
- **Engine version**: Aurora MySQL 3.04.0 (compatible with MySQL 8.0.28)

**Templates:**
- Select "Dev/Test" (cheaper for development)

**Settings:**
- **DB cluster identifier**: `mindcare-aurora-cluster`
- **Master username**: `admin`
- **Master password**: Create a strong password (save it!)
- **Confirm password**: Re-enter password

**Instance configuration:**
- **DB instance class**: Serverless v2
- **Minimum ACUs**: 0.5
- **Maximum ACUs**: 2

**Availability & durability:**
- ☐ Don't create an Aurora Replica (uncheck for dev)

**Connectivity:**
- **Virtual private cloud (VPC)**: Default VPC
- **DB subnet group**: `mindcare-db-subnet-group`
- **Public access**: Yes (for development)
- **VPC security group**: Create new
  - **New VPC security group name**: `mindcare-db-sg`
- **Availability Zone**: No preference

**Database authentication:**
- Select "Password authentication"

**Additional configuration:**
- **Initial database name**: `mindcare`
- **DB cluster parameter group**: default.aurora-mysql8.0
- **Backup retention period**: 7 days
- **Enable encryption**: ☑ Yes
- **Enable Enhanced monitoring**: ☐ No (to save costs)
- **Enable deletion protection**: ☐ No (for development)

Click "Create database"

**Wait 5-10 minutes for creation**

### 7.3 Configure Security Group

1. After database is created, click on cluster name
2. Click on "Connectivity & security" tab
3. Click on the security group link (e.g., `mindcare-db-sg`)
4. Click "Edit inbound rules"
5. Click "Add rule"

**Rule settings:**
- **Type**: MySQL/Aurora
- **Protocol**: TCP
- **Port**: 3306
- **Source**: My IP (for development)
  - Or "Anywhere-IPv4" (0.0.0.0/0) - less secure but easier

6. Click "Save rules"

### 7.4 Note Down Database Endpoint

1. Go back to RDS Console
2. Click on your cluster `mindcare-aurora-cluster`
3. **Writer endpoint**: Copy this (format: `mindcare-aurora-cluster.cluster-xxxxx.us-east-1.rds.amazonaws.com`)

### 7.5 Run Database Migrations

**Option 1: Using MySQL Workbench (GUI)**
1. Download MySQL Workbench: https://dev.mysql.com/downloads/workbench/
2. Open MySQL Workbench
3. Click "+" to create new connection
4. **Connection Name**: MindCare Aurora
5. **Hostname**: Your writer endpoint
6. **Port**: 3306
7. **Username**: admin
8. **Password**: Click "Store in Keychain" and enter your password
9. Click "Test Connection"
10. Click "OK"
11. Double-click the connection
12. Click "File" → "Open SQL Script"
13. Select `server/db/migrations.sql`
14. Click "Execute" (lightning bolt icon)
15. Verify all tables are created

**Option 2: Using MySQL CLI**
```bash
mysql -h mindcare-aurora-cluster.cluster-xxxxx.us-east-1.rds.amazonaws.com \
  -u admin \
  -p \
  mindcare < server/db/migrations.sql
```

### 7.6 Verify Tables Created

Run this query:
```sql
SHOW TABLES;
```

You should see:
- chat_messages
- counsellor_groups
- counsellor_sessions
- daily_analytics
- group_members
- journal_entries
- mood_check_ins
- rewards
- user_points
- user_rewards
- wellness_activities
- user_dashboard_summary (view)
- counsellor_dashboard_summary (view)

✅ **Aurora MySQL Setup Complete!**

---

## STEP 8: CloudWatch Setup (Monitoring & Logging)

### 8.1 Create Log Group

1. Go to CloudWatch Console: https://console.aws.amazon.com/cloudwatch
2. **Region**: Verify you're in **us-east-1**
3. Click "Log groups" in left sidebar
4. Click "Create log group"
5. **Log group name**: `/mindcare/application`
6. **Retention setting**: 7 days (to save costs)
7. Click "Create"

### 8.2 Verify Lambda Logs

1. Go to "Log groups"
2. You should see these log groups (auto-created by Lambda):
   - `/aws/lambda/mindcare-auth-handler`
   - `/aws/lambda/mindcare-chat-handler`
   - `/aws/lambda/mindcare-voice-handler`

### 8.3 Create CloudWatch Dashboard

1. Click "Dashboards" in left sidebar
2. Click "Create dashboard"
3. **Dashboard name**: `MindCare-Monitoring`
4. Click "Create dashboard"

**Add Lambda Metrics Widget:**
1. Click "Add widget"
2. Select "Line"
3. Click "Metrics"
4. Click "Lambda"
5. Click "By Function Name"
6. Select these metrics for all 3 functions:
   - Invocations
   - Errors
   - Duration
7. Click "Create widget"

**Add API Gateway Metrics Widget:**
1. Click "Add widget"
2. Select "Line"
3. Click "Metrics"
4. Click "API Gateway"
5. Click "By API Name"
6. Select:
   - Count (requests)
   - 4XXError
   - 5XXError
   - Latency
7. Click "Create widget"

8. Click "Save dashboard"

### 8.4 Create Alarms (Optional)

**High Error Rate Alarm:**
1. Click "Alarms" in left sidebar
2. Click "Create alarm"
3. Click "Select metric"
4. Click "Lambda" → "By Function Name"
5. Select "Errors" for `mindcare-chat-handler`
6. Click "Select metric"
7. **Statistic**: Sum
8. **Period**: 5 minutes
9. **Threshold**: Static
10. **Greater than**: 10
11. Click "Next"
12. **Alarm name**: `MindCare-HighErrorRate`
13. Click "Create alarm"

✅ **CloudWatch Setup Complete!**

---

## STEP 9: CloudFront Setup (CDN) - Optional

### 9.1 Create CloudFront Distribution

1. Go to CloudFront Console: https://console.aws.amazon.com/cloudfront
2. Click "Create distribution"

**Origin settings:**
- **Origin domain**: Your Amplify domain (add after Amplify setup)
- **Protocol**: HTTPS only
- **Name**: Leave default

**Default cache behavior:**
- **Viewer protocol policy**: Redirect HTTP to HTTPS
- **Allowed HTTP methods**: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
- **Cache policy**: CachingOptimized

**Settings:**
- **Price class**: Use only North America and Europe
- **Alternate domain name (CNAME)**: Leave empty (or add your custom domain)
- **Custom SSL certificate**: Default CloudFront certificate

Click "Create distribution"

**Wait 10-15 minutes for deployment**

✅ **CloudFront Setup Complete!**

---

## STEP 10: Update Environment Variables

### 10.1 Update Frontend .env File

Open `.env` file in your project root and update:

```env
# AWS Credentials (Already configured)
VITE_AWS_ACCESS_KEY_ID=AKIAXGR5Q7QN6N6LFHTF
VITE_AWS_SECRET_ACCESS_KEY=fW4EugBT9dbHTHVVzHKgGdD5tBWowy8G12brY2hH
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCOUNT_ID=495124020251

# Amazon Cognito (UPDATE THESE)
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX  # From Step 2.8
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx  # From Step 2.8
VITE_COGNITO_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  # From Step 2.9

# API Gateway (UPDATE THIS)
VITE_API_GATEWAY_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod  # From Step 6.6

# Amazon S3 Buckets (UPDATE THESE)
VITE_S3_BUCKET=mindcare-user-content  # From Step 3
VITE_S3_AUDIO_BUCKET=mindcare-audio-uploads  # From Step 3
VITE_S3_USER_CONTENT_BUCKET=mindcare-user-content  # From Step 3

# AWS Secrets Manager
VITE_DB_SECRET_NAME=mindcare/database/credentials
VITE_API_SECRET_NAME=mindcare/api/keys

# CloudFront Distribution (Optional)
VITE_CLOUDFRONT_DOMAIN=d1234567890.cloudfront.net  # From Step 9 (if created)

# Local Development
VITE_LOCAL_API_URL=http://localhost:8083
```

### 10.2 Update Lambda Environment Variables

**Update chat-handler Lambda:**
1. Go to Lambda Console
2. Click `mindcare-chat-handler`
3. Click "Configuration" → "Environment variables"
4. Click "Edit"
5. Update these variables:

| Key | Value |
|-----|-------|
| `DB_HOST` | Your Aurora endpoint (from Step 7.4) |
| `DB_USER` | `admin` |
| `DB_PASSWORD` | Your database password (from Step 7.2) |
| `DB_NAME` | `mindcare` |

6. Click "Save"

### 10.3 Create server/.env File (If Using Local Backend)

Create `server/.env` file:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAXGR5Q7QN6N6LFHTF
AWS_SECRET_ACCESS_KEY=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
AWS_ACCOUNT_ID=495124020251

# Amazon Cognito
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX  # From Step 2.8
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx  # From Step 2.8

# Amazon Bedrock
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0

# Amazon Transcribe
TRANSCRIBE_LANGUAGE_CODE=en-US

# Amazon Polly
POLLY_VOICE_ID=Joanna
POLLY_ENGINE=neural

# Amazon S3
S3_AUDIO_BUCKET=mindcare-audio-uploads  # From Step 3
S3_USER_CONTENT_BUCKET=mindcare-user-content  # From Step 3

# AWS Secrets Manager
DB_SECRET_NAME=mindcare/database/credentials

# Database (Aurora MySQL Serverless)
DB_HOST=mindcare-aurora-cluster.cluster-xxxxx.us-east-1.rds.amazonaws.com  # From Step 7.4
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=your_password_here  # From Step 7.2
DB_NAME=mindcare

# Server Configuration
PORT=8083
NODE_ENV=development

# API Security
API_KEY_SECRET=your_random_secret_here
JWT_SECRET=your_random_jwt_secret_here

# CORS
CORS_ORIGIN=http://localhost:5173

# CloudWatch Logging
CLOUDWATCH_LOG_GROUP=/mindcare/application
CLOUDWATCH_LOG_STREAM=backend-api
```

✅ **Environment Variables Updated!**

---

## STEP 11: Testing & Verification

### 11.1 Test Cognito Authentication

**Using AWS Console:**
1. Go to Cognito Console
2. Click on your user pool
3. Click "Users" tab
4. Click "Create user"
5. **Username**: `test@example.com`
6. **Email**: `test@example.com`
7. **Temporary password**: `Test@1234`
8. ☑ Mark email as verified
9. Click "Create user"

**Test login from your app:**
1. Start your frontend: `npm run dev`
2. Go to http://localhost:5173
3. Click "Sign In"
4. Enter email and password
5. You should be redirected to dashboard

### 11.2 Test Lambda Functions

**Test auth-handler:**
1. Go to Lambda Console
2. Click `mindcare-auth-handler`
3. Click "Test" tab
4. Click "Create new event"
5. **Event name**: `test-validate`
6. **Event JSON**:
```json
{
  "httpMethod": "POST",
  "path": "/auth/validate",
  "body": "{\"token\":\"test-token\"}"
}
```
7. Click "Test"
8. Check response (should return validation result)

### 11.3 Test API Gateway

**Using curl:**
```bash
# Test auth endpoint
curl -X POST https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/auth/validate \
  -H "Content-Type: application/json" \
  -d '{"token":"test-token"}'
```

### 11.4 Test S3 Upload

**Using AWS Console:**
1. Go to S3 Console
2. Click on `mindcare-audio-uploads`
3. Click "Upload"
4. Select a test audio file
5. Click "Upload"
6. Verify file appears in bucket

### 11.5 Test Bedrock

**Using AWS Console:**
1. Go to Bedrock Console
2. Click "Playgrounds" → "Chat"
3. Select "Claude 3 Sonnet"
4. Type: "Hello"
5. Click "Run"
6. Verify you get a response

### 11.6 Test Database Connection

**Using MySQL Workbench:**
1. Connect to your Aurora database
2. Run query:
```sql
SELECT * FROM mood_check_ins LIMIT 1;
```
3. Should return empty result (no error)

### 11.7 Test Complete Flow

1. Start frontend: `npm run dev`
2. Sign up new user
3. Verify email (check Cognito console)
4. Sign in
5. Go to AI Chatbot
6. Send a message
7. Verify response from Claude
8. Check CloudWatch logs for Lambda invocations

✅ **All Tests Complete!**

---

## STEP 12: Deploy to Production (Optional)

### 12.1 Deploy Frontend to Amplify

1. Go to Amplify Console: https://console.aws.amazon.com/amplify
2. Click "New app" → "Host web app"
3. Select "GitHub" (or your Git provider)
4. Authorize Amplify to access your repository
5. Select your repository and branch
6. **Build settings**: Auto-detected (Vite)
7. **Environment variables**: Add all VITE_* variables from .env
8. Click "Save and deploy"
9. Wait for deployment (5-10 minutes)
10. Note down Amplify URL

### 12.2 Update CORS Settings

Update S3 CORS to include Amplify URL:
```json
{
    "AllowedOrigins": [
        "http://localhost:5173",
        "https://YOUR_AMPLIFY_URL.amplifyapp.com"
    ]
}
```

Update API Gateway CORS similarly.

✅ **Production Deployment Complete!**

---

## 📋 Summary Checklist

- [ ] AWS Account setup
- [ ] IAM user verified
- [ ] Cognito User Pool created
- [ ] Cognito Identity Pool created
- [ ] S3 buckets created (2)
- [ ] S3 CORS configured
- [ ] Bedrock model access enabled
- [ ] Lambda IAM role created
- [ ] Lambda functions created (3)
- [ ] Lambda environment variables set
- [ ] API Gateway created
- [ ] API Gateway deployed
- [ ] Aurora MySQL cluster created
- [ ] Database migrations run
- [ ] CloudWatch log groups created
- [ ] CloudWatch dashboard created
- [ ] Environment variables updated
- [ ] All tests passed

---

## 🎉 Congratulations!

Your AWS infrastructure is now fully set up and ready to use!

**Next Steps:**
1. Start your frontend: `npm run dev`
2. Test all features
3. Monitor CloudWatch for any errors
4. Deploy to production when ready

**Important URLs to Save:**
- AWS Console: https://console.aws.amazon.com
- Cognito User Pool: [Your User Pool ID]
- API Gateway: [Your API URL]
- Aurora Endpoint: [Your DB Endpoint]
- CloudWatch Dashboard: [Your Dashboard URL]

---

**Setup Time**: 2-4 hours
**Status**: ✅ Complete
**Region**: us-east-1
