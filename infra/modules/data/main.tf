locals {
  name_prefix = "${var.project}-${var.env}"
}

# ── RDS ──────────────────────────────────────────────────────────────────────

resource "aws_db_subnet_group" "main" {
  name       = "${local.name_prefix}-db-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "${local.name_prefix}-db-subnet-group"
  }
}

resource "aws_db_instance" "main" {
  identifier        = "${local.name_prefix}-mysql"
  engine            = "mysql"
  engine_version    = "8.0"
  instance_class    = "db.t3.micro"
  allocated_storage = 20
  storage_type      = "gp2"

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.sg_rds_id]

  # 프리티어 조건 충족 설정
  multi_az                  = false
  publicly_accessible       = false
  backup_retention_period   = 1
  skip_final_snapshot       = true
  deletion_protection       = false
  auto_minor_version_upgrade = true

  tags = {
    Name = "${local.name_prefix}-mysql"
  }
}

# ── ElastiCache (Valkey/Redis) ────────────────────────────────────────────────

resource "aws_elasticache_subnet_group" "main" {
  name       = "${local.name_prefix}-cache-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "${local.name_prefix}-cache-subnet-group"
  }
}

resource "aws_elasticache_cluster" "main" {
  cluster_id           = "${local.name_prefix}-valkey"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379

  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [var.sg_elasticache_id]

  tags = {
    Name = "${local.name_prefix}-valkey"
  }
}
