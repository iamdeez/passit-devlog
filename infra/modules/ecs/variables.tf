variable "project" {
  type = string
}

variable "env" {
  type = string
}

variable "aws_region" {
  type    = string
  default = "ap-northeast-2"
}

variable "vpc_id" {
  type = string
}

variable "public_subnet_ids" {
  description = "Public subnets for ALB"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "Private subnets for ECS tasks"
  type        = list(string)
}

variable "sg_alb_id" {
  type = string
}

variable "sg_ecs_id" {
  type = string
}

variable "db_host" {
  description = "RDS endpoint host"
  type        = string
}

variable "db_name" {
  type    = string
  default = "passit_db"
}

variable "db_username" {
  type = string
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "cache_host" {
  description = "ElastiCache endpoint host"
  type        = string
}

variable "s3_bucket_name" {
  description = "S3 bucket name for ticket images"
  type        = string
}

variable "frontend_url" {
  description = "Frontend origin URL for CORS"
  type        = string
}
