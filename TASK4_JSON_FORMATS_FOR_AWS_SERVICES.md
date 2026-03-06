# TASK 4: JSON Formats for AWS Services Configuration

## 📋 Copy-Paste Ready JSON Configurations

This document provides ready-to-use JSON configurations for each AWS service. Simply copy, replace placeholders with your values, and paste into AWS Console.

---

## 🔐 1. Amazon Cognito - User Pool Configuration

### User Pool Creation (Not JSON - Use Console)

Cognito User Pool creation is done through the AWS Console wizard, not JSON. However, here's the configuration summary:

**Configuration Values:**
```json
{
  "UserPoolName": "mindcare-users",
  "Policies": {
    "PasswordPolicy": {
      "MinimumLength": 8,
      "RequireUppercase": true,
      "RequireLowercase": true,
      "RequireNumbers": true,
      "RequireSymbols": true
    }
  },
  "AutoVerifiedAttributes": ["email"],
  "UsernameAttributes": ["email"],
  "Schema": [
    {
      "Name": "email",
      "Required": true,
      "Mutable": true
    },
    {
      "Name": "name",
      "Required": true,
      "Mutable": true
    },
    {
      "Name": "role",
      "AttributeDataType": "String",
      "Mutable": true,
      "StringAttributeConstraints": {
        "MinLength": "1",
        "MaxLength": "20"
      }
    }
  ]
}
```

---

## 🪣 2. Amazon S3 - CORS Configuration

### S3 Bucket CORS Policy

**Copy this JSON and paste in S3 Console → Bucket → Permissions → CORS:**

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
            "https://mindcare.com",
            "https://www.mindcare.com"
        ],
        "ExposeHeaders": [
            "ETag",
            "x-amz-server-side-encryption",
            "x-amz-request-id",
            "x-amz-id-2",
            "x-amz-version-id"
        ],
        "MaxAgeSeconds": 3600
    }
]
```

**How to use:**
1. Go to S3 Console
2. Click on your bucket (e.g., `mindcare-audio-uploads`)
3. Click "Permissions" tab
4. Scroll to "Cross-origin resource sharing (CORS)"
5. Click "Edit"
6. Paste the JSON above
7. Click "Save changes"
8. Repeat for `mindcare-user-content` bucket

---

### S3 Bucket Policy (Public Read - Optional)

**Only use if you want public read access to specific files:**

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::mindcare-user-content/public/*"
        }
    ]
}
```

**Replace:** `mindcare-user-content` with your bucket name

---

### S3 Lifecycle Policy (Auto-delete old files)

**Copy this JSON and paste in S3 Console → Bucket → Management → Lifecycle rules:**

```json
{
    "Rules": [
        {
            "Id": "DeleteOldAudioFiles",
            "Status": "Enabled",
            "Filter": {
                "Prefix": ""
            },
            "Expiration": {
                "Days": 90
            },
            "NoncurrentVersionExpiration": {
                "NoncurrentDays": 30
            }
        }
    ]
}
```

---

## ⚡ 3. AWS Lambda - Environment Variables

### Lambda Function: auth-handler

**Copy this JSON and paste in Lambda Console → Configuration → Environment variables → Edit:**

```json
{
    "AWS_REGION": "us-east-1",
    "COGNITO_USER_POOL_ID": "us-east-1_XXXXXXXXX",
    "COGNITO_CLIENT_ID": "xxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

**Replace:**
- `us-east-1_XXXXXXXXX` with your User Pool ID
- `xxxxxxxxxxxxxxxxxxxxxxxxxx` with your App Client ID

---

### Lambda Function: chat-handler

```json
{
    "AWS_REGION": "us-east-1",
    "BEDROCK_MODEL_ID": "anthropic.claude-3-sonnet-20240229-v1:0",
    "DB_HOST": "mindcare-aurora-cluster.cluster-xxxxx.us-east-1.rds.amazonaws.com",
    "DB_PORT": "3306",
    "DB_USER": "admin",
    "DB_PASSWORD": "your_password_here",
    "DB_NAME": "mindcare"
}
```

**Replace:**
- `mindcare-aurora-cluster.cluster-xxxxx.us-east-1.rds.amazonaws.com` with your Aurora endpoint
- `your_password_here` with your database password

---

### Lambda Function: voice-handler

```json
{
    "AWS_REGION": "us-east-1",
    "S3_AUDIO_BUCKET": "mindcare-audio-uploads",
    "TRANSCRIBE_LANGUAGE_CODE": "en-US",
    "POLLY_VOICE_ID": "Joanna",
    "POLLY_ENGINE": "neural"
}
```

**Replace:**
- `mindcare-audio-uploads` with your audio bucket name

---

## 🌐 4. Amazon API Gateway - OpenAPI Specification

### Complete API Gateway Configuration

**Copy this JSON and use for API import:**

```json
{
  "openapi": "3.0.1",
  "info": {
    "title": "MindCareAPI",
    "description": "REST API for MindCare mental health platform",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "https://{apiId}.execute-api.us-east-1.amazonaws.com/{stage}",
      "variables": {
        "apiId": {
          "default": "xxxxxxxxxx"
        },
        "stage": {
          "default": "prod"
        }
      }
    }
  ],
  "paths": {
    "/auth/validate": {
      "post": {
        "summary": "Validate JWT token",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "token": {
                    "type": "string"
                  }
                },
                "required": ["token"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Token validation result"
          }
        },
        "x-amazon-apigateway-integration": {
          "type": "aws_proxy",
          "httpMethod": "POST",
          "uri": "arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:495124020251:function:mindcare-auth-handler/invocations"
        }
      }
    },
    "/auth/user": {
      "get": {
        "summary": "Get user information",
        "security": [
          {
            "CognitoAuthorizer": []
          }
        ],
        "responses": {
          "200": {
            "description": "User information"
          }
        },
        "x-amazon-apigateway-integration": {
          "type": "aws_proxy",
          "httpMethod": "POST",
          "uri": "arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:495124020251:function:mindcare-auth-handler/invocations"
        }
      }
    },
    "/chat/send": {
      "post": {
        "summary": "Send message to AI chatbot",
        "security": [
          {
            "CognitoAuthorizer": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "userId": {
                    "type": "string"
                  },
                  "message": {
                    "type": "string"
                  },
                  "conversationHistory": {
                    "type": "array",
                    "items": {
                      "type": "object"
                    }
                  }
                },
                "required": ["userId", "message"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "AI response"
          }
        },
        "x-amazon-apigateway-integration": {
          "type": "aws_proxy",
          "httpMethod": "POST",
          "uri": "arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:495124020251:function:mindcare-chat-handler/invocations"
        }
      }
    },
    "/voice/transcribe": {
      "post": {
        "summary": "Start voice transcription",
        "security": [
          {
            "CognitoAuthorizer": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "audioFileUri": {
                    "type": "string"
                  },
                  "userId": {
                    "type": "string"
                  }
                },
                "required": ["audioFileUri", "userId"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Transcription job started"
          }
        },
        "x-amazon-apigateway-integration": {
          "type": "aws_proxy",
          "httpMethod": "POST",
          "uri": "arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:495124020251:function:mindcare-voice-handler/invocations"
        }
      }
    },
    "/voice/synthesize": {
      "post": {
        "summary": "Synthesize speech from text",
        "security": [
          {
            "CognitoAuthorizer": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "text": {
                    "type": "string"
                  },
                  "voiceId": {
                    "type": "string",
                    "default": "Joanna"
                  },
                  "userId": {
                    "type": "string"
                  }
                },
                "required": ["text", "userId"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Audio synthesized successfully"
          }
        },
        "x-amazon-apigateway-integration": {
          "type": "aws_proxy",
          "httpMethod": "POST",
          "uri": "arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:495124020251:function:mindcare-voice-handler/invocations"
        }
      }
    }
  },
  "components": {
    "securitySchemes": {
      "CognitoAuthorizer": {
        "type": "apiKey",
        "name": "Authorization",
        "in": "header",
        "x-amazon-apigateway-authtype": "cognito_user_pools",
        "x-amazon-apigateway-authorizer": {
          "type": "cognito_user_pools",
          "providerARNs": [
            "arn:aws:cognito-idp:us-east-1:495124020251:userpool/us-east-1_XXXXXXXXX"
          ]
        }
      }
    }
  },
  "x-amazon-apigateway-cors": {
    "allowOrigins": [
      "http://localhost:5173",
      "https://*.amplifyapp.com"
    ],
    "allowMethods": [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "OPTIONS"
    ],
    "allowHeaders": [
      "Content-Type",
      "Authorization",
      "X-Amz-Date",
      "X-Api-Key",
      "X-Amz-Security-Token"
    ],
    "maxAge": 3600
  }
}
```

**Replace:**
- `495124020251` with your AWS Account ID
- `us-east-1_XXXXXXXXX` with your Cognito User Pool ID

**How to use:**
1. Save as `api-gateway-config.json`
2. Go to API Gateway Console
3. Click "Create API" → "REST API" → "Import"
4. Upload the JSON file
5. Click "Import"

---

## 🔐 5. AWS IAM - Policies and Roles

### IAM Role: Lambda Execution Role

**Trust Policy (Who can assume this role):**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

**Permissions Policy (What this role can do):**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CloudWatchLogs",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogStreams"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    },
    {
      "Sid": "CognitoAccess",
      "Effect": "Allow",
      "Action": [
        "cognito-idp:AdminGetUser",
        "cognito-idp:AdminUpdateUserAttributes",
        "cognito-idp:AdminDeleteUser",
        "cognito-idp:ListUsers",
        "cognito-idp:GetUser"
      ],
      "Resource": "arn:aws:cognito-idp:us-east-1:495124020251:userpool/*"
    },
    {
      "Sid": "BedrockAccess",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "arn:aws:bedrock:us-east-1::foundation-model/*"
    },
    {
      "Sid": "TranscribeAccess",
      "Effect": "Allow",
      "Action": [
        "transcribe:StartTranscriptionJob",
        "transcribe:GetTranscriptionJob",
        "transcribe:ListTranscriptionJobs"
      ],
      "Resource": "*"
    },
    {
      "Sid": "PollyAccess",
      "Effect": "Allow",
      "Action": [
        "polly:SynthesizeSpeech",
        "polly:DescribeVoices"
      ],
      "Resource": "*"
    },
    {
      "Sid": "S3Access",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::mindcare-audio-uploads/*",
        "arn:aws:s3:::mindcare-user-content/*",
        "arn:aws:s3:::mindcare-audio-uploads",
        "arn:aws:s3:::mindcare-user-content"
      ]
    },
    {
      "Sid": "SecretsManagerAccess",
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-1:495124020251:secret:mindcare/*"
    },
    {
      "Sid": "CloudWatchMetrics",
      "Effect": "Allow",
      "Action": [
        "cloudwatch:PutMetricData",
        "cloudwatch:GetMetricStatistics",
        "cloudwatch:ListMetrics"
      ],
      "Resource": "*"
    }
  ]
}
```

**Replace:**
- `495124020251` with your AWS Account ID
- `mindcare-audio-uploads` with your audio bucket name
- `mindcare-user-content` with your user content bucket name

**How to use:**
1. Go to IAM Console → Roles → Create role
2. Select "Lambda" as trusted entity
3. Click "Next"
4. Click "Create policy" → JSON tab
5. Paste the Permissions Policy JSON above
6. Name it `MindCareLambdaExecutionPolicy`
7. Attach this policy to your role

---

### IAM Role: Cognito Authenticated Users

**Trust Policy:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "cognito-identity.amazonaws.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "cognito-identity.amazonaws.com:aud": "us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        },
        "ForAnyValue:StringLike": {
          "cognito-identity.amazonaws.com:amr": "authenticated"
        }
      }
    }
  ]
}
```

**Replace:** `us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` with your Identity Pool ID

**Permissions Policy:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::mindcare-user-content/${cognito-identity.amazonaws.com:sub}/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "execute-api:Invoke"
      ],
      "Resource": [
        "arn:aws:execute-api:us-east-1:495124020251:*/prod/*"
      ]
    }
  ]
}
```

---

## 🌍 6. Amazon CloudFront - Distribution Configuration

### CloudFront Distribution Configuration

```json
{
  "Comment": "CloudFront distribution for MindCare frontend",
  "Enabled": true,
  "HttpVersion": "http2and3",
  "IsIPV6Enabled": true,
  "PriceClass": "PriceClass_100",
  "Origins": [
    {
      "Id": "AmplifyOrigin",
      "DomainName": "main.d1234567890.amplifyapp.com",
      "CustomOriginConfig": {
        "HTTPPort": 80,
        "HTTPSPort": 443,
        "OriginProtocolPolicy": "https-only",
        "OriginSslProtocols": ["TLSv1.2"],
        "OriginReadTimeout": 30,
        "OriginKeepaliveTimeout": 5
      }
    },
    {
      "Id": "S3Origin",
      "DomainName": "mindcare-user-content.s3.us-east-1.amazonaws.com",
      "S3OriginConfig": {
        "OriginAccessIdentity": ""
      }
    }
  ],
  "DefaultCacheBehavior": {
    "TargetOriginId": "AmplifyOrigin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"],
    "CachedMethods": ["GET", "HEAD", "OPTIONS"],
    "Compress": true,
    "ForwardedValues": {
      "QueryString": true,
      "Cookies": {
        "Forward": "none"
      },
      "Headers": ["Authorization", "CloudFront-Forwarded-Proto"]
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000
  },
  "CacheBehaviors": [
    {
      "PathPattern": "/static/*",
      "TargetOriginId": "AmplifyOrigin",
      "ViewerProtocolPolicy": "redirect-to-https",
      "AllowedMethods": ["GET", "HEAD", "OPTIONS"],
      "CachedMethods": ["GET", "HEAD", "OPTIONS"],
      "Compress": true,
      "ForwardedValues": {
        "QueryString": false,
        "Cookies": {
          "Forward": "none"
        }
      },
      "MinTTL": 0,
      "DefaultTTL": 31536000,
      "MaxTTL": 31536000
    }
  ],
  "CustomErrorResponses": [
    {
      "ErrorCode": 403,
      "ResponsePagePath": "/index.html",
      "ResponseCode": "200",
      "ErrorCachingMinTTL": 300
    },
    {
      "ErrorCode": 404,
      "ResponsePagePath": "/index.html",
      "ResponseCode": "200",
      "ErrorCachingMinTTL": 300
    }
  ],
  "ViewerCertificate": {
    "CloudFrontDefaultCertificate": true,
    "MinimumProtocolVersion": "TLSv1.2_2021"
  },
  "Restrictions": {
    "GeoRestriction": {
      "RestrictionType": "none"
    }
  }
}
```

**Replace:**
- `main.d1234567890.amplifyapp.com` with your Amplify domain
- `mindcare-user-content` with your S3 bucket name

---

## 📊 7. Amazon CloudWatch - Log Group Configuration

### CloudWatch Log Group

**Create via AWS CLI:**

```bash
aws logs create-log-group \
  --log-group-name /mindcare/application \
  --region us-east-1
```

**Or via JSON (for CloudFormation):**

```json
{
  "Type": "AWS::Logs::LogGroup",
  "Properties": {
    "LogGroupName": "/mindcare/application",
    "RetentionInDays": 7
  }
}
```

---

### CloudWatch Metric Filter

**Filter Pattern for Errors:**

```json
{
  "filterName": "ErrorCount",
  "filterPattern": "[time, request_id, event_type = ERROR*, ...]",
  "metricTransformations": [
    {
      "metricName": "ErrorCount",
      "metricNamespace": "MindCare",
      "metricValue": "1",
      "defaultValue": 0
    }
  ]
}
```

---

### CloudWatch Alarm Configuration

```json
{
  "AlarmName": "MindCare-HighErrorRate",
  "AlarmDescription": "Triggers when error rate exceeds threshold",
  "ActionsEnabled": true,
  "MetricName": "Errors",
  "Namespace": "AWS/Lambda",
  "Statistic": "Sum",
  "Dimensions": [
    {
      "Name": "FunctionName",
      "Value": "mindcare-chat-handler"
    }
  ],
  "Period": 300,
  "EvaluationPeriods": 1,
  "Threshold": 10,
  "ComparisonOperator": "GreaterThanThreshold",
  "TreatMissingData": "notBreaching"
}
```

---

## 🔒 8. AWS Secrets Manager - Secret Configuration

### Database Credentials Secret

```json
{
  "username": "admin",
  "password": "YourSecurePassword123!",
  "engine": "mysql",
  "host": "mindcare-aurora-cluster.cluster-xxxxx.us-east-1.rds.amazonaws.com",
  "port": 3306,
  "dbname": "mindcare"
}
```

**How to use:**
1. Go to Secrets Manager Console
2. Click "Store a new secret"
3. Select "Other type of secret"
4. Paste the JSON above in key-value pairs
5. Name it `mindcare/database/credentials`
6. Click "Store"

---

### API Keys Secret

```json
{
  "jwt_secret": "your-random-jwt-secret-here-min-32-chars",
  "api_key_secret": "your-random-api-key-secret-here",
  "encryption_key": "your-random-encryption-key-here"
}
```

**Generate random secrets:**
```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate API key secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🗄️ 9. Amazon RDS - Aurora MySQL Configuration

### Aurora Cluster Parameter Group

```json
{
  "DBClusterParameterGroupName": "mindcare-aurora-params",
  "DBParameterGroupFamily": "aurora-mysql8.0",
  "Description": "Custom parameter group for MindCare Aurora cluster",
  "Parameters": [
    {
      "ParameterName": "character_set_server",
      "ParameterValue": "utf8mb4",
      "ApplyMethod": "immediate"
    },
    {
      "ParameterName": "collation_server",
      "ParameterValue": "utf8mb4_unicode_ci",
      "ApplyMethod": "immediate"
    },
    {
      "ParameterName": "max_connections",
      "ParameterValue": "1000",
      "ApplyMethod": "immediate"
    },
    {
      "ParameterName": "innodb_buffer_pool_size",
      "ParameterValue": "{DBInstanceClassMemory*3/4}",
      "ApplyMethod": "pending-reboot"
    }
  ]
}
```

---

## 🚀 10. AWS Amplify - Build Configuration

### amplify.yml (Build Specification)

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

**How to use:**
1. Create `amplify.yml` in your project root
2. Commit to Git
3. Amplify will auto-detect and use it

---

### Amplify Environment Variables (JSON format)

```json
{
  "VITE_AWS_REGION": "us-east-1",
  "VITE_COGNITO_USER_POOL_ID": "us-east-1_XXXXXXXXX",
  "VITE_COGNITO_CLIENT_ID": "xxxxxxxxxxxxxxxxxxxxxxxxxx",
  "VITE_COGNITO_IDENTITY_POOL_ID": "us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "VITE_API_GATEWAY_URL": "https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod",
  "VITE_S3_BUCKET": "mindcare-user-content",
  "VITE_S3_AUDIO_BUCKET": "mindcare-audio-uploads",
  "VITE_S3_USER_CONTENT_BUCKET": "mindcare-user-content"
}
```

**How to use:**
1. Go to Amplify Console
2. Click on your app
3. Click "Environment variables"
4. Add each key-value pair from the JSON above

---

## 📝 11. Complete Infrastructure as Code (CloudFormation)

### CloudFormation Template (Simplified)

```json
{
  "AWSTemplateFormatVersion": "2010-09-09",
  "Description": "MindCare Infrastructure Stack",
  "Parameters": {
    "CognitoUserPoolId": {
      "Type": "String",
      "Description": "Cognito User Pool ID"
    },
    "AudioBucketName": {
      "Type": "String",
      "Default": "mindcare-audio-uploads"
    },
    "UserContentBucketName": {
      "Type": "String",
      "Default": "mindcare-user-content"
    }
  },
  "Resources": {
    "AudioUploadsBucket": {
      "Type": "AWS::S3::Bucket",
      "Properties": {
        "BucketName": {
          "Ref": "AudioBucketName"
        },
        "CorsConfiguration": {
          "CorsRules": [
            {
              "AllowedHeaders": ["*"],
              "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
              "AllowedOrigins": ["*"],
              "MaxAge": 3600
            }
          ]
        }
      }
    },
    "UserContentBucket": {
      "Type": "AWS::S3::Bucket",
      "Properties": {
        "BucketName": {
          "Ref": "UserContentBucketName"
        },
        "CorsConfiguration": {
          "CorsRules": [
            {
              "AllowedHeaders": ["*"],
              "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
              "AllowedOrigins": ["*"],
              "MaxAge": 3600
            }
          ]
        }
      }
    },
    "LambdaExecutionRole": {
      "Type": "AWS::IAM::Role",
      "Properties": {
        "RoleName": "MindCareLambdaExecutionRole",
        "AssumeRolePolicyDocument": {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Principal": {
                "Service": "lambda.amazonaws.com"
              },
              "Action": "sts:AssumeRole"
            }
          ]
        },
        "ManagedPolicyArns": [
          "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
          "arn:aws:iam::aws:policy/AmazonCognitoPowerUser",
          "arn:aws:iam::aws:policy/AmazonBedrockFullAccess",
          "arn:aws:iam::aws:policy/AmazonTranscribeFullAccess",
          "arn:aws:iam::aws:policy/AmazonPollyFullAccess",
          "arn:aws:iam::aws:policy/AmazonS3FullAccess"
        ]
      }
    }
  },
  "Outputs": {
    "AudioBucketName": {
      "Value": {
        "Ref": "AudioUploadsBucket"
      },
      "Description": "Name of the audio uploads bucket"
    },
    "UserContentBucketName": {
      "Value": {
        "Ref": "UserContentBucket"
      },
      "Description": "Name of the user content bucket"
    },
    "LambdaExecutionRoleArn": {
      "Value": {
        "Fn::GetAtt": ["LambdaExecutionRole", "Arn"]
      },
      "Description": "ARN of the Lambda execution role"
    }
  }
}
```

**How to use:**
1. Save as `mindcare-infrastructure.json`
2. Go to CloudFormation Console
3. Click "Create stack"
4. Upload the template
5. Fill in parameters
6. Click "Create stack"

---

## ✅ Quick Reference: Where to Paste Each JSON

| Service | Where to Paste | File/Section |
|---------|----------------|--------------|
| **S3 CORS** | S3 Console → Bucket → Permissions → CORS | Paste JSON directly |
| **Lambda Env Vars** | Lambda Console → Function → Configuration → Environment variables | Add key-value pairs |
| **API Gateway** | API Gateway Console → Create API → Import | Upload JSON file |
| **IAM Policy** | IAM Console → Policies → Create policy → JSON tab | Paste JSON directly |
| **CloudFront** | CloudFront Console → Create distribution | Use as reference (not direct paste) |
| **Secrets Manager** | Secrets Manager Console → Store new secret | Add key-value pairs |
| **CloudFormation** | CloudFormation Console → Create stack | Upload JSON file |

---

## 🎯 Summary

- **Total JSON Configurations**: 11
- **Services Covered**: S3, Lambda, API Gateway, IAM, CloudFront, CloudWatch, Secrets Manager, RDS, Amplify, CloudFormation
- **Ready to Use**: Yes, just replace placeholders with your values

**Next Steps:**
1. Copy each JSON configuration
2. Replace placeholders (marked with XXXXXXXXX or your_value_here)
3. Paste into appropriate AWS Console location
4. Save and test

---

**Status**: ✅ All JSON configurations ready
**Format**: Copy-paste ready
**Placeholders**: Clearly marked for replacement
