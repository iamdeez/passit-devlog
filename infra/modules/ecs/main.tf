locals {
  name_prefix = "${var.project}-${var.env}"

  services = {
    account = { port = 8081, cpu = 256, memory = 512 }
    ticket  = { port = 8082, cpu = 256, memory = 512 }
    trade   = { port = 8083, cpu = 256, memory = 512 }
    chat    = { port = 8084, cpu = 256, memory = 512 }
    cs      = { port = 8085, cpu = 256, memory = 512 }
  }
}

# ── ECR ──────────────────────────────────────────────────────────────────────

resource "aws_ecr_repository" "services" {
  for_each = local.services

  name                 = "${local.name_prefix}/service-${each.key}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${local.name_prefix}-ecr-${each.key}"
  }
}

# ── CloudWatch Log Groups ─────────────────────────────────────────────────────

resource "aws_cloudwatch_log_group" "services" {
  for_each = local.services

  name              = "/ecs/${local.name_prefix}/service-${each.key}"
  retention_in_days = 7

  tags = {
    Name = "${local.name_prefix}-logs-${each.key}"
  }
}

# ── IAM: ECS Task Execution Role ─────────────────────────────────────────────

resource "aws_iam_role" "ecs_task_execution" {
  name = "${local.name_prefix}-ecs-task-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# ── IAM: ECS Task Role (S3 접근 허용) ────────────────────────────────────────

resource "aws_iam_role" "ecs_task" {
  name = "${local.name_prefix}-ecs-task"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "ecs_task_s3" {
  name = "${local.name_prefix}-ecs-task-s3"
  role = aws_iam_role.ecs_task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ]
      Resource = [
        "arn:aws:s3:::${var.s3_bucket_name}",
        "arn:aws:s3:::${var.s3_bucket_name}/*"
      ]
    }]
  })
}

# ── ECS Cluster ───────────────────────────────────────────────────────────────

resource "aws_ecs_cluster" "main" {
  name = "${local.name_prefix}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "${local.name_prefix}-cluster"
  }
}

# ── ALB ──────────────────────────────────────────────────────────────────────

resource "aws_lb" "main" {
  name               = "${local.name_prefix}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.sg_alb_id]
  subnets            = var.public_subnet_ids

  tags = {
    Name = "${local.name_prefix}-alb"
  }
}

resource "aws_lb_target_group" "services" {
  for_each = local.services

  name        = "${local.name_prefix}-tg-${each.key}"
  port        = each.value.port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path                = "/actuator/health"
    interval            = 30
    timeout             = 10
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200"
  }

  tags = {
    Name = "${local.name_prefix}-tg-${each.key}"
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  # account-service를 기본 응답으로 설정
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.services["account"].arn
  }
}

resource "aws_lb_listener_rule" "services" {
  for_each = {
    ticket = { paths = ["/api/tickets/*"], priority = 10 }
    trade  = { paths = ["/api/trades/*", "/api/deals/*"], priority = 20 }
    chat   = { paths = ["/api/chat/*", "/ws/*"], priority = 30 }
    cs     = { paths = ["/api/cs/*", "/api/notices/*", "/api/faqs/*", "/api/inquiries/*"], priority = 40 }
    account = { paths = ["/api/auth/*", "/api/users/*"], priority = 50 }
  }

  listener_arn = aws_lb_listener.http.arn
  priority     = each.value.priority

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.services[each.key].arn
  }

  condition {
    path_pattern {
      values = each.value.paths
    }
  }
}

# ── ECS Task Definitions ──────────────────────────────────────────────────────

resource "aws_ecs_task_definition" "account" {
  family                   = "${local.name_prefix}-service-account"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = local.services.account.cpu
  memory                   = local.services.account.memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name  = "service-account"
    image = "${aws_ecr_repository.services["account"].repository_url}:latest"
    portMappings = [{ containerPort = 8081, protocol = "tcp" }]
    environment = [
      { name = "DB_HOST",     value = var.db_host },
      { name = "DB_PORT",     value = "3306" },
      { name = "DB_NAME",     value = var.db_name },
      { name = "DB_USER",     value = var.db_username },
      { name = "DB_PASSWORD", value = var.db_password },
      { name = "REDIS_HOST",  value = var.cache_host },
      { name = "REDIS_PORT",  value = "6379" },
      { name = "REDIS_PASSWORD", value = "" },
      { name = "FRONTEND_URL", value = var.frontend_url },
      { name = "SPRING_JPA_HIBERNATE_DDL_AUTO", value = "update" }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.services["account"].name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

resource "aws_ecs_task_definition" "ticket" {
  family                   = "${local.name_prefix}-service-ticket"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = local.services.ticket.cpu
  memory                   = local.services.ticket.memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name  = "service-ticket"
    image = "${aws_ecr_repository.services["ticket"].repository_url}:latest"
    portMappings = [{ containerPort = 8082, protocol = "tcp" }]
    environment = [
      { name = "DB_HOST",                value = var.db_host },
      { name = "DB_PORT",                value = "3306" },
      { name = "DB_NAME",                value = var.db_name },
      { name = "DB_USER",                value = var.db_username },
      { name = "DB_PASSWORD",            value = var.db_password },
      { name = "AWS_REGION",             value = var.aws_region },
      { name = "S3_BUCKET",              value = var.s3_bucket_name },
      { name = "SPRING_JPA_HIBERNATE_DDL_AUTO", value = "update" }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.services["ticket"].name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

resource "aws_ecs_task_definition" "trade" {
  family                   = "${local.name_prefix}-service-trade"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = local.services.trade.cpu
  memory                   = local.services.trade.memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name  = "service-trade"
    image = "${aws_ecr_repository.services["trade"].repository_url}:latest"
    portMappings = [{ containerPort = 8083, protocol = "tcp" }]
    environment = [
      { name = "DB_HOST",     value = var.db_host },
      { name = "DB_PORT",     value = "3306" },
      { name = "DB_NAME",     value = var.db_name },
      { name = "DB_USER",     value = var.db_username },
      { name = "DB_PASSWORD", value = var.db_password },
      { name = "TICKET_SERVICE_URL", value = "http://internal-alb-url/api/tickets" },
      { name = "FRONTEND_URL", value = var.frontend_url },
      { name = "SPRING_JPA_HIBERNATE_DDL_AUTO", value = "update" }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.services["trade"].name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

resource "aws_ecs_task_definition" "chat" {
  family                   = "${local.name_prefix}-service-chat"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = local.services.chat.cpu
  memory                   = local.services.chat.memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name  = "service-chat"
    image = "${aws_ecr_repository.services["chat"].repository_url}:latest"
    portMappings = [{ containerPort = 8084, protocol = "tcp" }]
    environment = [
      { name = "DB_HOST",     value = var.db_host },
      { name = "DB_PORT",     value = "3306" },
      { name = "DB_NAME",     value = var.db_name },
      { name = "DB_USER",     value = var.db_username },
      { name = "DB_PASSWORD", value = var.db_password },
      { name = "FRONTEND_URL", value = var.frontend_url },
      { name = "SPRING_JPA_HIBERNATE_DDL_AUTO", value = "update" }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.services["chat"].name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

resource "aws_ecs_task_definition" "cs" {
  family                   = "${local.name_prefix}-service-cs"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = local.services.cs.cpu
  memory                   = local.services.cs.memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name  = "service-cs"
    image = "${aws_ecr_repository.services["cs"].repository_url}:latest"
    portMappings = [{ containerPort = 8085, protocol = "tcp" }]
    environment = [
      { name = "DB_HOST",     value = var.db_host },
      { name = "DB_PORT",     value = "3306" },
      { name = "DB_NAME",     value = var.db_name },
      { name = "DB_USER",     value = var.db_username },
      { name = "DB_PASSWORD", value = var.db_password },
      { name = "REDIS_HOST",  value = var.cache_host },
      { name = "REDIS_PORT",  value = "6379" },
      { name = "REDIS_PASSWORD", value = "" },
      { name = "SPRING_JPA_HIBERNATE_DDL_AUTO", value = "update" }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.services["cs"].name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

# ── ECS Services ──────────────────────────────────────────────────────────────

resource "aws_ecs_service" "account" {
  name            = "${local.name_prefix}-service-account"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.account.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.sg_ecs_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.services["account"].arn
    container_name   = "service-account"
    container_port   = 8081
  }

  depends_on = [aws_lb_listener.http]
}

resource "aws_ecs_service" "ticket" {
  name            = "${local.name_prefix}-service-ticket"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.ticket.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.sg_ecs_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.services["ticket"].arn
    container_name   = "service-ticket"
    container_port   = 8082
  }

  depends_on = [aws_lb_listener.http]
}

resource "aws_ecs_service" "trade" {
  name            = "${local.name_prefix}-service-trade"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.trade.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.sg_ecs_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.services["trade"].arn
    container_name   = "service-trade"
    container_port   = 8083
  }

  depends_on = [aws_lb_listener.http]
}

resource "aws_ecs_service" "chat" {
  name            = "${local.name_prefix}-service-chat"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.chat.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.sg_ecs_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.services["chat"].arn
    container_name   = "service-chat"
    container_port   = 8084
  }

  depends_on = [aws_lb_listener.http]
}

resource "aws_ecs_service" "cs" {
  name            = "${local.name_prefix}-service-cs"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.cs.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.sg_ecs_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.services["cs"].arn
    container_name   = "service-cs"
    container_port   = 8085
  }

  depends_on = [aws_lb_listener.http]
}
