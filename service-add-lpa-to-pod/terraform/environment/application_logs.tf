resource "aws_cloudwatch_log_group" "application_logs" {
  name              = "${local.environment_name}-add-lpa-to-pod-application-logs"
  retention_in_days = 14
  provider          = aws.eu_west_1
}
resource "aws_cloudwatch_query_definition" "app_container_messages" {
  name            = "Hackday/Add-LPA-to-Pods/${local.environment_name} app container messages"
  log_group_names = [aws_cloudwatch_log_group.application_logs.name]

  query_string = <<EOF
fields @timestamp, message, concat(method, " ", url) as request, status
| filter @message not like "ELB-HealthChecker"
| sort @timestamp desc
EOF
  provider     = aws.eu_west_1
}
