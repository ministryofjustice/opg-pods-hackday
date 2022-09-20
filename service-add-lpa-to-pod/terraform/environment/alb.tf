resource "aws_lb_target_group" "app" {
  name                 = "${local.environment_name}-add-lpa-to-pod-app"
  port                 = 80
  protocol             = "HTTP"
  target_type          = "ip"
  vpc_id               = data.aws_vpc.main.id
  deregistration_delay = 0
  depends_on           = [aws_lb.app]

  health_check {
    enabled = true
    path    = "/start"
  }

  provider = aws.eu_west_1
}

resource "aws_lb" "app" {
  name                       = "${local.environment_name}-add-lpa-to-pod-app"
  internal                   = false #tfsec:ignore:AWS005 - public alb
  load_balancer_type         = "application"
  drop_invalid_header_fields = true
  subnets                    = data.aws_subnet.public.*.id
  enable_deletion_protection = false
  security_groups            = [aws_security_group.app_loadbalancer.id]
  provider                   = aws.eu_west_1
}

resource "aws_lb_listener" "app_loadbalancer_http_redirect" {
  load_balancer_arn = aws_lb.app.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = 443
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
  provider = aws.eu_west_1
}

data "aws_acm_certificate" "certificate_app" {
  domain   = "*.add-lpa-to-pod.hackday.opg.service.justice.gov.uk"
  provider = aws.eu_west_1
}

resource "aws_lb_listener" "app_loadbalancer" {
  load_balancer_arn = aws_lb.app.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-FS-1-2-2019-08"
  certificate_arn   = data.aws_acm_certificate.certificate_app.arn

  default_action {
    target_group_arn = aws_lb_target_group.app.arn
    type             = "forward"
  }
  provider = aws.eu_west_1
}

resource "aws_lb_listener_certificate" "app_loadbalancer_live_service_certificate" {
  listener_arn    = aws_lb_listener.app_loadbalancer.arn
  certificate_arn = data.aws_acm_certificate.certificate_app.arn
  provider        = aws.eu_west_1
}

resource "aws_security_group" "app_loadbalancer" {
  name_prefix = "${local.environment_name}-add-lpa-to-pod-app-loadbalancer"
  description = "app service application load balancer"
  vpc_id      = data.aws_vpc.main.id
  lifecycle {
    create_before_destroy = true
  }
  provider = aws.eu_west_1
}

resource "aws_security_group_rule" "app_loadbalancer_port_80_redirect_ingress" {
  description       = "Port 80 ingress for redirection to port 443"
  type              = "ingress"
  from_port         = 80
  to_port           = 80
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"] #tfsec:ignore:aws-vpc-no-public-ingress-sgr - open ingress for production
  security_group_id = aws_security_group.app_loadbalancer.id
  provider          = aws.eu_west_1
}

resource "aws_security_group_rule" "app_loadbalancer_public_ingress" {
  description       = "Port 443 public ingress to the application load balancer"
  type              = "ingress"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"] #tfsec:ignore:aws-vpc-no-public-ingress-sgr - open ingress for production
  security_group_id = aws_security_group.app_loadbalancer.id
  provider          = aws.eu_west_1
}

resource "aws_security_group_rule" "app_loadbalancer_egress" {
  description       = "Allow any egress from service load balancer"
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"] #tfsec:ignore:aws-ec2-no-public-egress-sgr - open egress for load balancers
  security_group_id = aws_security_group.app_loadbalancer.id
  provider          = aws.eu_west_1
}
