resource "aws_acm_certificate" "knowtfolio" {
  domain_name               = var.domain
  subject_alternative_names = ["*.${var.domain}"]
  validation_method         = "DNS"

  provider = aws.virginia
}