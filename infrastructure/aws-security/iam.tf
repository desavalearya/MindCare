data "aws_caller_identity" "current" {}

# ---------------------------------------------------------------------------
# ECS Task Role
# Used by application containers to access AWS services at runtime
# ---------------------------------------------------------------------------
data "aws_iam_policy_document" "ecs_task_assume_role" {
  statement {
    sid     = "ECSTasksTrustPolicy"
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_task_role" {
  name               = "MindMate-ECSTaskRole"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume_role.json
  description        = "Role assumed by MindMate ECS task containers to access AWS services"

  tags = {
    Name = "MindMate-ECSTaskRole"
  }
}

# Inline policy granting least-privilege access for runtime application needs
data "aws_iam_policy_document" "ecs_task_permissions" {
  # CloudWatch Logs – write application logs
  statement {
    sid    = "CloudWatchLogsWrite"
    effect = "Allow"
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
      "logs:DescribeLogStreams"
    ]
    resources = [
      "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/mindmate/*",
      "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/mindmate/*:log-stream:*"
    ]
  }

  # Secrets Manager – read application secrets
  statement {
    sid    = "SecretsManagerRead"
    effect = "Allow"
    actions = [
      "secretsmanager:GetSecretValue",
      "secretsmanager:DescribeSecret"
    ]
    resources = [
      "arn:aws:secretsmanager:${var.aws_region}:${data.aws_caller_identity.current.account_id}:secret:mindmate/*"
    ]
  }

  # Amazon Bedrock – invoke foundation models
  statement {
    sid    = "BedrockInvoke"
    effect = "Allow"
    actions = [
      "bedrock:InvokeModel",
      "bedrock:InvokeModelWithResponseStream"
    ]
    resources = [
      "arn:aws:bedrock:${var.aws_region}::foundation-model/*"
    ]
  }

  # Amazon Transcribe – speech-to-text transcription
  statement {
    sid    = "TranscribeUsage"
    effect = "Allow"
    actions = [
      "transcribe:StartTranscriptionJob",
      "transcribe:GetTranscriptionJob",
      "transcribe:ListTranscriptionJobs",
      "transcribe:StartStreamTranscription"
    ]
    resources = ["*"]
  }

  # Amazon Polly – text-to-speech synthesis
  statement {
    sid    = "PollyUsage"
    effect = "Allow"
    actions = [
      "polly:SynthesizeSpeech",
      "polly:DescribeVoices",
      "polly:GetLexicon",
      "polly:ListLexicons"
    ]
    resources = ["*"]
  }

  # Amazon S3 – read/write application data buckets only
  statement {
    sid    = "S3ReadWrite"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:ListBucket",
      "s3:GetBucketLocation"
    ]
    resources = [
      "arn:aws:s3:::mindmate-*",
      "arn:aws:s3:::mindmate-*/*"
    ]
  }

  # KMS – decrypt secrets and encrypted data using the MindMate key
  statement {
    sid    = "KMSDecrypt"
    effect = "Allow"
    actions = [
      "kms:Decrypt",
      "kms:GenerateDataKey"
    ]
    resources = [
      aws_kms_key.mindmate.arn
    ]
  }
}

resource "aws_iam_role_policy" "ecs_task_policy" {
  name   = "MindMate-ECSTaskPolicy"
  role   = aws_iam_role.ecs_task_role.id
  policy = data.aws_iam_policy_document.ecs_task_permissions.json
}

# ---------------------------------------------------------------------------
# ECS Execution Role
# Used by ECS control plane to pull container images and push logs
# ---------------------------------------------------------------------------
resource "aws_iam_role" "ecs_execution_role" {
  name               = "MindMate-ECSExecutionRole"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume_role.json
  description        = "Role used by ECS agent to pull images from ECR and send logs to CloudWatch"

  tags = {
    Name = "MindMate-ECSExecutionRole"
  }
}

data "aws_iam_policy_document" "ecs_execution_permissions" {
  # ECR – pull container images
  statement {
    sid    = "ECRPullImages"
    effect = "Allow"
    actions = [
      "ecr:GetAuthorizationToken",
      "ecr:BatchCheckLayerAvailability",
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage"
    ]
    resources = ["*"]
  }

  # CloudWatch Logs – create log groups/streams and push logs
  statement {
    sid    = "CloudWatchLogsWrite"
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
      "logs:DescribeLogStreams",
      "logs:DescribeLogGroups"
    ]
    resources = [
      "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/mindmate/*",
      "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/mindmate/*:log-stream:*"
    ]
  }

  # Secrets Manager – fetch secrets during container startup
  statement {
    sid    = "SecretsManagerRead"
    effect = "Allow"
    actions = [
      "secretsmanager:GetSecretValue",
      "secretsmanager:DescribeSecret"
    ]
    resources = [
      "arn:aws:secretsmanager:${var.aws_region}:${data.aws_caller_identity.current.account_id}:secret:mindmate/*"
    ]
  }

  # KMS – decrypt secrets fetched from Secrets Manager
  statement {
    sid    = "KMSDecrypt"
    effect = "Allow"
    actions = [
      "kms:Decrypt",
      "kms:GenerateDataKey"
    ]
    resources = [
      aws_kms_key.mindmate.arn
    ]
  }
}

resource "aws_iam_role_policy" "ecs_execution_policy" {
  name   = "MindMate-ECSExecutionPolicy"
  role   = aws_iam_role.ecs_execution_role.id
  policy = data.aws_iam_policy_document.ecs_execution_permissions.json
}
