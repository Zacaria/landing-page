resource "aws_route53_zone" "zone" {
  name = var.domain

  tags = {
    ENV = var.stage
  }
}

resource "aws_route53_record" "cname" {
  zone_id = aws_route53_zone.zone.zone_id
  name    = var.cname
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.distribution.domain_name
    zone_id                = aws_cloudfront_distribution.distribution.hosted_zone_id
    evaluate_target_health = false
  }
}
