# ---------------------------------------------------------------------------
# S3 Bucket – CloudTrail audit log storage
# ---------------------------------------------------------------------------
resource "aws_s3_bucket" "cloudtrail_logs" {
  bucket        = var.cloudtrail_s3_bucket_name
  force_destroy = false

  tags = {
    Name = "mindmate-cloudtrail-audit-logs"
  }
}

resource "aws_s3_bucket_versioning" "cloudtrail_logs" {
  bucket = aws_s3_bucket.cloudtrail_logs.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "cloudtrail_logs" {
  bucket = aws_s3_bucket.cloudtrail_logs.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.mindmate.arn
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "cloudtrail_logs" {
  bucket = aws_s3_bucket.cloudtrail_logs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "cloudtrail_logs" {
  bucket = aws_s3_bucket.cloudtrail_logs.id

  rule {
    id     = "transition-to-ia-then-glacier"
    status = "Enabled"

    transition {
      days          = 90
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 365
      storage_class = "GLACIER"
    }

    expiration {
      days = 2555 # 7 years – common compliance requirement for audit logs
    }
  }
}

# Bucket policy: allow CloudTrail to write logs and enforce TLS
data "aws_iam_policy_document" "cloudtrail_bucket_policy" {
  statement {
    sid    = "AWSCloudTrailAclCheck"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["cloudtrail.amazonaws.com"]
    }
    actions   = ["s3:GetBucketAcl"]
    resources = [aws_s3_bucket.cloudtrail_logs.arn]
  }

  statement {
    sid    = "AWSCloudTrailWrite"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["cloudtrail.amazonaws.com"]
    }
    actions   = ["s3:PutObject"]
    resources = ["${aws_s3_bucket.cloudtrail_logs.arn}/AWSLogs/${data.aws_caller_identity.current.account_id}/*"]
    condition {
      test     = "StringEquals"
      variable = "s3:x-amz-acl"
      values   = ["bucket-owner-full-control"]
    }
  }

  statement {
    sid    = "DenyNonTLSRequests"
    effect = "Deny"
    principals {
      type        = "AWS"
      identifiers = ["*"]
    }
    actions   = ["s3:*"]
    resources = [aws_s3_bucket.cloudtrail_logs.arn, "${aws_s3_bucket.cloudtrail_logs.arn}/*"]
    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values   = ["false"]
    }
  }
}

resource "aws_s3_bucket_policy" "cloudtrail_logs" {
  bucket = aws_s3_bucket.cloudtrail_logs.id
  policy = data.aws_iam_policy_document.cloudtrail_bucket_policy.json

  depends_on = [aws_s3_bucket_public_access_block.cloudtrail_logs]
}

# ---------------------------------------------------------------------------
# CloudWatch Log Group – MindMate backend application logs
# ---------------------------------------------------------------------------
resource "aws_cloudwatch_log_group" "mindmate_backend" {
  name              = "/mindmate/backend"
  retention_in_days = var.cloudwatch_log_retention_days
  kms_key_id        = aws_kms_key.mindmate.arn

  tags = {
    Name = "mindmate-backend-logs"
  }
}

# ---------------------------------------------------------------------------
# CloudTrail – MindMate audit trail (multi-region)
# ---------------------------------------------------------------------------
resource "aws_cloudtrail" "mindmate_audit" {
  name                          = "MindMate-AuditTrail"
  s3_bucket_name                = aws_s3_bucket.cloudtrail_logs.id
  include_global_service_events = true
  is_multi_region_trail         = true
  enable_log_file_validation    = true
  kms_key_id                    = aws_kms_key.mindmate.arn

  cloud_watch_logs_group_arn = "${aws_cloudwatch_log_group.mindmate_backend.arn}:*"
  cloud_watch_logs_role_arn  = aws_iam_role.cloudtrail_cloudwatch.arn

  event_selector {
    read_write_type           = "All"
    include_management_events = true

    data_resource {
      type   = "AWS::S3::Object"
      values = ["${aws_s3_bucket.cloudtrail_logs.arn}/"]
    }
  }

  tags = {
    Name = "MindMate-AuditTrail"
  }

  depends_on = [
    aws_s3_bucket_policy.cloudtrail_logs,
    aws_cloudwatch_log_group.mindmate_backend
  ]
}

# ---------------------------------------------------------------------------
# IAM Role – allows CloudTrail to deliver events to CloudWatch Logs
# ---------------------------------------------------------------------------
data "aws_iam_policy_document" "cloudtrail_assume" {
  statement {
    sid     = "CloudTrailAssumeRole"
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["cloudtrail.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "cloudtrail_cloudwatch" {
  name               = "MindMate-CloudTrailCloudWatchRole"
  assume_role_policy = data.aws_iam_policy_document.cloudtrail_assume.json
  description        = "Allows CloudTrail to deliver log events to CloudWatch Logs"

  tags = {
    Name = "MindMate-CloudTrailCloudWatchRole"
  }
}

data "aws_iam_policy_document" "cloudtrail_cloudwatch_permissions" {
  statement {
    sid    = "CloudTrailCreateLogStream"
    effect = "Allow"
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = [
      "${aws_cloudwatch_log_group.mindmate_backend.arn}:*"
    ]
  }
}

resource "aws_iam_role_policy" "cloudtrail_cloudwatch_policy" {
  name   = "MindMate-CloudTrailCloudWatchPolicy"
  role   = aws_iam_role.cloudtrail_cloudwatch.id
  policy = data.aws_iam_policy_document.cloudtrail_cloudwatch_permissions.json
}
