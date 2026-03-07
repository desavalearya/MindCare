@echo off
REM MindCare Environment Setup Script for Windows
REM This script helps you set up environment variables interactively

echo =========================================
echo MindCare AWS Environment Setup
echo =========================================
echo.

REM Check if .env already exists
if exist ".env" (
    echo WARNING: .env file already exists!
    set /p overwrite="Do you want to overwrite it? (y/N): "
    if /i not "%overwrite%"=="y" (
        echo Setup cancelled.
        exit /b 0
    )
)

echo Please provide your AWS resource information:
echo.

REM AWS Region
set /p aws_region="AWS Region (default: us-east-1): "
if "%aws_region%"=="" set aws_region=us-east-1

REM Cognito
echo.
echo --- Amazon Cognito ---
set /p cognito_user_pool_id="User Pool ID: "
set /p cognito_client_id="App Client ID: "
set /p cognito_identity_pool_id="Identity Pool ID: "

REM S3
echo.
echo --- Amazon S3 ---
set /p s3_bucket_name="Main S3 Bucket Name: "
set /p s3_audio_bucket="Audio S3 Bucket Name: "

REM Bedrock
echo.
echo --- Amazon Bedrock ---
set /p bedrock_model_id="Bedrock Model ID (default: anthropic.claude-3-sonnet-20240229-v1:0): "
if "%bedrock_model_id%"=="" set bedrock_model_id=anthropic.claude-3-sonnet-20240229-v1:0

REM API Gateway
echo.
echo --- API Gateway ---
set /p api_gateway_url="API Gateway URL: "

REM CloudFront
echo.
echo --- CloudFront ---
set /p cloudfront_domain="CloudFront Domain: "

REM Create .env file
(
echo # AWS Configuration
echo VITE_AWS_REGION=%aws_region%
echo.
echo # Amazon Cognito
echo VITE_COGNITO_USER_POOL_ID=%cognito_user_pool_id%
echo VITE_COGNITO_CLIENT_ID=%cognito_client_id%
echo VITE_COGNITO_IDENTITY_POOL_ID=%cognito_identity_pool_id%
echo.
echo # Amazon S3
echo VITE_S3_BUCKET_NAME=%s3_bucket_name%
echo VITE_S3_AUDIO_BUCKET=%s3_audio_bucket%
echo.
echo # Amazon Bedrock
echo VITE_BEDROCK_MODEL_ID=%bedrock_model_id%
echo.
echo # API Gateway
echo VITE_API_GATEWAY_URL=%api_gateway_url%
echo.
echo # CloudFront
echo VITE_CLOUDFRONT_DOMAIN=%cloudfront_domain%
echo.
echo # Application Settings
echo VITE_APP_NAME=MindCare
echo VITE_APP_VERSION=1.0.0
) > .env

echo.
echo ✓ .env file created successfully!
echo.
echo Next steps:
echo 1. Review the .env file to ensure all values are correct
echo 2. Configure Lambda function environment variables in AWS Console
echo 3. Run 'npm install' to install dependencies
echo 4. Run 'npm run dev' to start the development server
echo.
echo For detailed instructions, see AWS_ENVIRONMENT_SETUP_GUIDE.md

pause
