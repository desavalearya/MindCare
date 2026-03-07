#!/bin/bash

# MindCare Environment Setup Script
# This script helps you set up environment variables interactively

echo "========================================="
echo "MindCare AWS Environment Setup"
echo "========================================="
echo ""

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " overwrite
    if [ "$overwrite" != "y" ] && [ "$overwrite" != "Y" ]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

echo "Please provide your AWS resource information:"
echo ""

# AWS Region
read -p "AWS Region (default: us-east-1): " aws_region
aws_region=${aws_region:-us-east-1}

# Cognito
echo ""
echo "--- Amazon Cognito ---"
read -p "User Pool ID: " cognito_user_pool_id
read -p "App Client ID: " cognito_client_id
read -p "Identity Pool ID: " cognito_identity_pool_id

# S3
echo ""
echo "--- Amazon S3 ---"
read -p "Main S3 Bucket Name: " s3_bucket_name
read -p "Audio S3 Bucket Name: " s3_audio_bucket

# Bedrock
echo ""
echo "--- Amazon Bedrock ---"
read -p "Bedrock Model ID (default: anthropic.claude-3-sonnet-20240229-v1:0): " bedrock_model_id
bedrock_model_id=${bedrock_model_id:-anthropic.claude-3-sonnet-20240229-v1:0}

# API Gateway
echo ""
echo "--- API Gateway ---"
read -p "API Gateway URL: " api_gateway_url

# CloudFront
echo ""
echo "--- CloudFront ---"
read -p "CloudFront Domain: " cloudfront_domain

# Create .env file
cat > .env << EOF
# AWS Configuration
VITE_AWS_REGION=$aws_region

# Amazon Cognito
VITE_COGNITO_USER_POOL_ID=$cognito_user_pool_id
VITE_COGNITO_CLIENT_ID=$cognito_client_id
VITE_COGNITO_IDENTITY_POOL_ID=$cognito_identity_pool_id

# Amazon S3
VITE_S3_BUCKET_NAME=$s3_bucket_name
VITE_S3_AUDIO_BUCKET=$s3_audio_bucket

# Amazon Bedrock
VITE_BEDROCK_MODEL_ID=$bedrock_model_id

# API Gateway
VITE_API_GATEWAY_URL=$api_gateway_url

# CloudFront
VITE_CLOUDFRONT_DOMAIN=$cloudfront_domain

# Application Settings
VITE_APP_NAME=MindCare
VITE_APP_VERSION=1.0.0
EOF

echo ""
echo "✅ .env file created successfully!"
echo ""
echo "Next steps:"
echo "1. Review the .env file to ensure all values are correct"
echo "2. Configure Lambda function environment variables in AWS Console"
echo "3. Run 'npm install' to install dependencies"
echo "4. Run 'npm run dev' to start the development server"
echo ""
echo "For detailed instructions, see AWS_ENVIRONMENT_SETUP_GUIDE.md"
