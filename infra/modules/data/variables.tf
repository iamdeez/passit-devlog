variable "project" {
  type = string
}

variable "env" {
  type = string
}

variable "vpc_id" {
  description = "VPC ID from network module"
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for DB subnet group"
  type        = list(string)
}

variable "sg_rds_id" {
  description = "Security group ID for RDS"
  type        = string
}

variable "sg_elasticache_id" {
  description = "Security group ID for ElastiCache"
  type        = string
}

variable "db_name" {
  description = "Initial database name"
  type        = string
  default     = "passit_db"
}

variable "db_username" {
  description = "RDS master username"
  type        = string
  default     = "passit_user"
}

variable "db_password" {
  description = "RDS master password"
  type        = string
  sensitive   = true
}
