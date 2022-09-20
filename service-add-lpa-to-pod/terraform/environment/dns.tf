data "aws_route53_zone" "hackday" {
  provider = aws.management_eu_west_1
  name     = "hackday.opg.service.justice.gov.uk"
}

resource "aws_route53_record" "app" {
  # add-lpa-to-pod.hackday.opg.service.justice.gov.uk
  provider = aws.management_eu_west_1
  zone_id  = data.aws_route53_zone.hackday.zone_id
  name     = "${local.environment_name}.add-lpa-to-pod.${data.aws_route53_zone.hackday.name}"
  type     = "A"

  alias {
    evaluate_target_health = false
    name                   = aws_lb.app.dns_name
    zone_id                = aws_lb.app.zone_id
  }

  lifecycle {
    create_before_destroy = true
  }
}

output "app_fqdn" {
  value = aws_route53_record.app.fqdn
}
