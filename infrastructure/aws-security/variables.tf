variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "ap-south-1"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
}

variable "db_username" {
  description = "Database username placeholder for Secrets Manager"
  type        = string
  default     = "mindmate_app_user"
  sensitive   = true
}

variable "db_password" {
  description = "Database password placeholder for Secrets Manager"
  type        = string
  default     = "REPLACE_WITH_SECURE_PASSWORD"
  sensitive   = true
}

variable "db_host" {
  description = "Database host placeholder for Secrets Manager"
  type        = string
  default     = "REPLACE_WITH_DB_ENDPOINT"
}

variable "db_name" {
  description = "Database name placeholder for Secrets Manager"
  type        = string
  default     = "MindMate"
}

variable "api_key" {
  description = "Backend API key placeholder for Secrets Manager"
  type        = string
  default     = "REPLACE_WITH_API_KEY"
  sensitive   = true
}

variable "gemini_api_key" {
  description = "Gemini AI API key placeholder for Secrets Manager"
  type        = string
  default     = "REPLACE_WITH_GEMINI_API_KEY"
  sensitive   = true
}

variable "google_client_id" {
  description = "Google OAuth client ID placeholder for Secrets Manager"
  type        = string
  default     = "REPLACE_WITH_GOOGLE_CLIENT_ID"
  sensitive   = true
}

variable "google_client_secret" {
  description = "Google OAuth client secret placeholder for Secrets Manager"
  type        = string
  default     = "REPLACE_WITH_GOOGLE_CLIENT_SECRET"
  sensitive   = true
}

variable "cloudtrail_s3_bucket_name" {
  description = "Globally unique S3 bucket name for CloudTrail audit logs"
  type        = string
  default     = "mindmate-cloudtrail-audit-logs-dev"
}

variable "cloudwatch_log_retention_days" {
  description = "CloudWatch log group retention period in days"
  type        = number
  default     = 30
}
