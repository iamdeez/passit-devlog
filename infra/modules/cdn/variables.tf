variable "project" {
  type = string
}

variable "env" {
  type = string
}

variable "alb_dns_name" {
  description = "ALB DNS name for API origin"
  type        = string
}
