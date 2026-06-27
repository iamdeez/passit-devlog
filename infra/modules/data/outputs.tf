output "db_endpoint" {
  description = "RDS MySQL endpoint (host:port)"
  value       = aws_db_instance.main.endpoint
}

output "db_name" {
  description = "Database name"
  value       = aws_db_instance.main.db_name
}

output "db_username" {
  description = "Database master username"
  value       = aws_db_instance.main.username
}

output "cache_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = aws_elasticache_cluster.main.cache_nodes[0].address
}

output "cache_port" {
  description = "ElastiCache Redis port"
  value       = aws_elasticache_cluster.main.port
}
