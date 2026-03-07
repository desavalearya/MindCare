output "ecs_task_role_arn" {
  description = "ARN of the MindMate ECS Task IAM Role"
  value       = aws_iam_role.ecs_task_role.arn
}

output "ecs_execution_role_arn" {
  description = "ARN of the MindMate ECS Execution IAM Role"
  value       = aws_iam_role.ecs_execution_role.arn
}

output "kms_key_arn" {
  description = "ARN of the MindMate KMS encryption key"
  value       = aws_kms_key.mindmate.arn
}

output "kms_key_alias" {
  description = "Alias of the MindMate KMS encryption key"
  value       = aws_kms_alias.mindmate.name
}

output "secrets_manager_secret_arn" {
  description = "ARN of the MindMate Secrets Manager secret"
  value       = aws_secretsmanager_secret.backend.arn
}

output "cloudwatch_log_group_name" {
  description = "Name of the MindMate CloudWatch log group"
  value       = aws_cloudwatch_log_group.mindmate_backend.name
}

output "cloudwatch_log_group_arn" {
  description = "ARN of the MindMate CloudWatch log group"
  value       = aws_cloudwatch_log_group.mindmate_backend.arn
}

output "cloudtrail_trail_arn" {
  description = "ARN of the MindMate CloudTrail audit trail"
  value       = aws_cloudtrail.mindmate_audit.arn
}

output "cloudtrail_s3_bucket_name" {
  description = "Name of the S3 bucket storing CloudTrail audit logs"
  value       = aws_s3_bucket.cloudtrail_logs.bucket
}

output "guardduty_detector_id" {
  description = "ID of the GuardDuty detector"
  value       = aws_guardduty_detector.mindmate.id
}
