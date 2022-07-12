resource "aws_route53_zone" "knowtfolio" {
  name          = var.domain
  force_destroy = false
}

resource "aws_route53_record" "knowtfolio_record_verify_code" {
  name = "_d395d33dad203cf5531d043859133433.knowtfolio.com."
  records = [
    "_f87bd708fde05acc4defe491da3e4b77.btkxpdzscj.acm-validations.aws."
  ]
  ttl     = "300"
  type    = "CNAME"
  zone_id = aws_route53_zone.knowtfolio.id
}

resource "aws_route53_record" "knowtfolio_cloudfront" {
  zone_id = aws_route53_zone.knowtfolio.id
  name    = var.domain
  type    = "A"

  alias {
    evaluate_target_health = false
    name                   = aws_cloudfront_distribution.knowtfolio.domain_name
    zone_id                = aws_cloudfront_distribution.knowtfolio.hosted_zone_id
  }
}