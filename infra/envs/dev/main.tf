terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "local" {}
}

provider "aws" {
  region = var.aws_region
}

# ── 1. Network ────────────────────────────────────────────────────────────────

module "network" {
  source = "../../modules/network"

  project = var.project
  env     = var.env
}

# ── 2. Data (RDS + ElastiCache) ───────────────────────────────────────────────

module "data" {
  source = "../../modules/data"

  project = var.project
  env     = var.env

  vpc_id             = module.network.vpc_id
  private_subnet_ids = module.network.private_subnet_ids
  sg_rds_id          = module.network.sg_rds_id
  sg_elasticache_id  = module.network.sg_elasticache_id

  db_password = var.db_password
}

# ── 3. ECS (ECR + Fargate + ALB) ─────────────────────────────────────────────

module "ecs" {
  source = "../../modules/ecs"

  project    = var.project
  env        = var.env
  aws_region = var.aws_region

  vpc_id             = module.network.vpc_id
  public_subnet_ids  = module.network.public_subnet_ids
  private_subnet_ids = module.network.private_subnet_ids
  sg_alb_id          = module.network.sg_alb_id
  sg_ecs_id          = module.network.sg_ecs_id

  db_host     = split(":", module.data.db_endpoint)[0]
  db_name     = module.data.db_name
  db_username = module.data.db_username
  db_password = var.db_password

  cache_host = module.data.cache_endpoint

  s3_bucket_name = "${var.project}-${var.env}-tickets"
  frontend_url   = var.frontend_url
}

# ── 4. CDN (S3 + CloudFront) ──────────────────────────────────────────────────

module "cdn" {
  source = "../../modules/cdn"

  project      = var.project
  env          = var.env
  alb_dns_name = module.ecs.alb_dns_name
}
