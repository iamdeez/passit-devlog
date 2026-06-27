output "alb_dns_name" {
  description = "ALB DNS name (use as CloudFront origin)"
  value       = aws_lb.main.dns_name
}

output "alb_arn" {
  description = "ALB ARN"
  value       = aws_lb.main.arn
}

output "cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "ecr_urls" {
  description = "ECR repository URLs keyed by service name"
  value       = { for k, v in aws_ecr_repository.services : k => v.repository_url }
}
