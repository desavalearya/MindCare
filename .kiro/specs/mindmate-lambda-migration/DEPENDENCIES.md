# MindMate AWS Lambda Migration - Dependencies

## 1️⃣ Frontend Dependencies Installation

### Required AWS SDK Packages
```bash
cd /path/to/frontend
npm install @aws-sdk/client-cognito-identity-provider \
  @aws-sdk/client-s3 \
  @aws-sdk/s3-request-presigner \
  @aws-sdk/client-bedrock-runtime \
  @aws-sdk/client-transcribe \
  @aws-sdk/client-polly \
  aws-amplify \
  @aws-amplify/ui-react
```

### Verify Existing Dependencies
```bash
# Already installed (verified from package.json):
# - react@18.3.1
# - react-router-dom@6.30.1
# - @tanstack/react-query@5.83.0
# - zod@3.25.76
# - react-hook-form@7.61.1
```

## 2️⃣ Backend Lambda Dependencies

### Create package.json for Lambda functions
```bash
mkdir -p lambda-functions
cd lambda-functions
npm init -y
```

### Install Lambda Dependencies
```bash
npm install @aws-sdk/client-cognito-identity-provider \
  @aws-sdk/client-s3 \
  @aws-sdk/client-bedrock-runtime \
  @aws-sdk/client-transcribe \
  @aws-sdk/client-polly \
  @aws-sdk/client-secrets-manager \
  mysql2 \
  jsonwebtoken \
  bcryptjs
```

### Lambda Layer Dependencies (shared across functions)
```bash
mkdir -p lambda-layers/nodejs
cd lambda-layers/nodejs
npm init -y
npm install mysql2 @aws-sdk/client-secrets-manager
```

## 3️⃣ Infrastructure as Code Dependencies

### AWS CDK (recommended)
```bash
npm install -g aws-cdk
mkdir infrastructure
cd infrastructure
cdk init app --language typescript
npm install @aws-cdk/aws-lambda \
  @aws-cdk/aws-apigateway \
  @aws-cdk/aws-cognito \
  @aws-cdk/aws-rds \
  @aws-cdk/aws-s3 \
  @aws-cdk/aws-cloudwatch
```

### Alternative: Serverless Framework
```bash
npm install -g serverless
npm install serverless-offline \
  serverless-plugin-typescript \
  serverless-prune-plugin
```

## 4️⃣ Development Dependencies
```bash
npm install --save-dev \
  @types/aws-lambda \
  @types/node \
  @types/bcryptjs \
  @types/jsonwebtoken \
  esbuild \
  typescript
```

## Version Compatibility Matrix

| Package | Version | Notes |
|---------|---------|-------|
| Node.js | 18.x or 20.x | Lambda runtime |
| @aws-sdk/* | ^3.x | AWS SDK v3 |
| mysql2 | ^3.10.0 | Aurora MySQL |
| aws-amplify | ^6.x | Frontend auth |
| typescript | ^5.x | Type safety |

## Environment Variables Required

### Frontend (.env)
```bash
VITE_AWS_REGION=us-east-1
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXX
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxx
VITE_API_GATEWAY_URL=https://xxxxx.execute-api.us-east-1.amazonaws.com/prod
VITE_S3_BUCKET=mindmate-uploads
```

### Lambda Functions (AWS Secrets Manager)
```bash
DB_HOST=mindmate-aurora.cluster-xxxxx.us-east-1.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=<stored-in-secrets-manager>
DB_NAME=mindmate
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
TRANSCRIBE_LANGUAGE_CODE=en-US
POLLY_VOICE_ID=Joanna
```
