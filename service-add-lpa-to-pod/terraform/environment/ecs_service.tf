resource "aws_ecs_service" "app" {
  name                  = "app"
  cluster               = aws_ecs_cluster.main.id
  task_definition       = aws_ecs_task_definition.app.arn
  desired_count         = 1
  platform_version      = "1.4.0"
  wait_for_steady_state = true
  propagate_tags        = "SERVICE"

  capacity_provider_strategy {
    capacity_provider = "FARGATE_SPOT"
    weight            = 100
  }

  network_configuration {
    security_groups  = [aws_security_group.app_ecs_service.id]
    subnets          = data.aws_subnet.application.*.id
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "app"
    container_port   = 3000
  }

  lifecycle {
    create_before_destroy = true
  }

  timeouts {
    create = "7m"
    update = "7m"
  }
  provider = aws.eu_west_1
}

resource "aws_security_group" "app_ecs_service" {
  name_prefix = "${local.environment_name}-ecs-service"
  description = "app service security group"
  vpc_id      = data.aws_vpc.main.id
  lifecycle {
    create_before_destroy = true
  }
  provider = aws.eu_west_1
}

resource "aws_security_group_rule" "app_ecs_service_ingress" {
  description              = "Allow Port 80 ingress from the application load balancer"
  type                     = "ingress"
  from_port                = 80
  to_port                  = 3000
  protocol                 = "tcp"
  security_group_id        = aws_security_group.app_ecs_service.id
  source_security_group_id = aws_security_group.app_loadbalancer.id
  lifecycle {
    create_before_destroy = true
  }
  provider = aws.eu_west_1
}

resource "aws_security_group_rule" "app_ecs_service_egress" {
  description       = "Allow any egress from service"
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"] #tfsec:ignore:aws-ec2-no-public-egress-sgr - open egress for ECR access
  security_group_id = aws_security_group.app_ecs_service.id
  lifecycle {
    create_before_destroy = true
  }
  provider = aws.eu_west_1
}

resource "aws_ecs_task_definition" "app" {
  family                   = local.environment_name
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 512
  memory                   = 1024
  container_definitions    = "[${local.app}]"
  task_role_arn            = aws_iam_role.app_task_role.arn
  execution_role_arn       = aws_iam_role.execution_role.arn
  provider                 = aws.eu_west_1
}

resource "aws_iam_role_policy" "app_task_role" {
  name     = "${local.environment_name}-app-task-role"
  policy   = data.aws_iam_policy_document.task_role_access_policy.json
  role     = aws_iam_role.app_task_role.name
  provider = aws.eu_west_1
}

data "aws_iam_policy_document" "task_role_access_policy" {
  statement {
    sid    = "XrayAccess"
    effect = "Allow"

    actions = [
      "xray:PutTraceSegments",
      "xray:PutTelemetryRecords",
      "xray:GetSamplingRules",
      "xray:GetSamplingTargets",
      "xray:GetSamplingStatisticSummaries",
    ]

    resources = ["*"]
  }

  provider = aws.eu_west_1
}

data "aws_ecr_repository" "app" {
  name     = "pods-hackday/app"
  provider = aws.management_eu_west_1
}

locals {
  app = jsonencode(
    {
      cpu         = 1,
      essential   = true,
      image       = "${data.aws_ecr_repository.app.repository_url}:${var.container_version}",
      mountPoints = [],
      name        = "app",
      portMappings = [
        {
          containerPort = 3000,
          hostPort      = 3000,
          protocol      = "tcp"
        }
      ],
      volumesFrom = [],
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          awslogs-group         = aws_cloudwatch_log_group.application_logs.name,
          awslogs-region        = data.aws_region.current.name,
          awslogs-stream-prefix = local.environment_name
        }
      },
      environment = [
        {
          name  = "LOGGING_LEVEL",
          value = tostring(100)
        },
        {
          name  = "APP_PORT",
          value = tostring(3000)
        }
      ]
    }
  )
}
