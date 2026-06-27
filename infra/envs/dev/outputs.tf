output "cloudfront_domain" {
  description = "CloudFront domain (public entry point)"
  value       = module.cdn.cloudfront_domain
}

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = module.ecs.alb_dns_name
}

output "ecr_urls" {
  description = "ECR repository URLs"
  value       = module.ecs.ecr_urls
}

output "db_endpoint" {
  description = "RDS endpoint"
  value       = module.data.db_endpoint
}

output "frontend_bucket" {
  description = "S3 bucket for frontend static files"
  value       = module.cdn.frontend_bucket_name
}
