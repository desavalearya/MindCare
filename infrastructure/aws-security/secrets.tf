resource "aws_secretsmanager_secret" "backend" {
  name                    = "mindmate/backend-secrets"
  description             = "MindMate backend application secrets (DB credentials, API keys, OAuth config)"
  kms_key_id              = aws_kms_key.mindmate.arn
  recovery_window_in_days = 30

  tags = {
    Name = "mindmate-backend-secrets"
  }
}

resource "aws_secretsmanager_secret_version" "backend" {
  secret_id = aws_secretsmanager_secret.backend.id

  secret_string = jsonencode({
    DB_HOST              = var.db_host
    DB_PORT              = "3306"
    DB_USER              = var.db_username
    DB_PASSWORD          = var.db_password
    DB_NAME              = var.db_name
    API_KEY              = var.api_key
    GEMINI_API_KEY       = var.gemini_api_key
    GOOGLE_CLIENT_ID     = var.google_client_id
    GOOGLE_CLIENT_SECRET = var.google_client_secret
  })
}
