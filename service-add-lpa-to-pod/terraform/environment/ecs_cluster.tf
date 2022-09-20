resource "aws_ecs_cluster" "main" {
  name = local.environment_name
  setting {
    name  = "containerInsights"
    value = "disabled"
  }
  provider = aws.eu_west_1
}
