variable "project" {
  description = "Project name prefix"
  type        = string
  default     = "passit"
}

variable "env" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-2"
}

variable "db_password" {
  description = "RDS master password"
  type        = string
  sensitive   = true
}

variable "frontend_url" {
  description = "Frontend URL for CORS (CloudFront domain or custom domain)"
  type        = string
  default     = "https://example.cloudfront.net"
}
