data "aws_iam_policy_document" "mindmate_kms_key_policy" {
  # Full access for the root account – required so the key is not locked out
  statement {
    sid    = "RootAccountFullAccess"
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"]
    }
    actions   = ["kms:*"]
    resources = ["*"]
  }

  # Allow ECS Task Role to use the key for encrypt/decrypt
  statement {
    sid    = "ECSTaskRoleUsage"
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = [aws_iam_role.ecs_task_role.arn]
    }
    actions = [
      "kms:Decrypt",
      "kms:GenerateDataKey",
      "kms:DescribeKey"
    ]
    resources = ["*"]
  }

  # Allow ECS Execution Role to decrypt secrets on container startup
  statement {
    sid    = "ECSExecutionRoleUsage"
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = [aws_iam_role.ecs_execution_role.arn]
    }
    actions = [
      "kms:Decrypt",
      "kms:GenerateDataKey",
      "kms:DescribeKey"
    ]
    resources = ["*"]
  }

  # Allow CloudTrail to use the key to encrypt logs
  statement {
    sid    = "CloudTrailEncrypt"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["cloudtrail.amazonaws.com"]
    }
    actions = [
      "kms:GenerateDataKey",
      "kms:Decrypt",
      "kms:DescribeKey"
    ]
    resources = ["*"]
    condition {
      test     = "StringLike"
      variable = "kms:EncryptionContext:aws:cloudtrail:arn"
      values   = ["arn:aws:cloudtrail:*:${data.aws_caller_identity.current.account_id}:trail/*"]
    }
  }

  # Allow CloudWatch Logs to use the key
  statement {
    sid    = "CloudWatchLogsEncrypt"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["logs.${var.aws_region}.amazonaws.com"]
    }
    actions = [
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey",
      "kms:DescribeKey"
    ]
    resources = ["*"]
    condition {
      test     = "ArnLike"
      variable = "kms:EncryptionContext:aws:logs:arn"
      values   = ["arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:*"]
    }
  }

  # Allow Secrets Manager to use the key
  statement {
    sid    = "SecretsManagerEncrypt"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["secretsmanager.amazonaws.com"]
    }
    actions = [
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey",
      "kms:DescribeKey"
    ]
    resources = ["*"]
  }
}

resource "aws_kms_key" "mindmate" {
  description             = "MindMate symmetric encryption key for secrets, logs, and future database storage"
  enable_key_rotation     = true
  deletion_window_in_days = 30
  policy                  = data.aws_iam_policy_document.mindmate_kms_key_policy.json

  tags = {
    Name = "mindmate-encryption-key"
  }
}

resource "aws_kms_alias" "mindmate" {
  name          = "alias/mindmate-encryption-key"
  target_key_id = aws_kms_key.mindmate.key_id
}
