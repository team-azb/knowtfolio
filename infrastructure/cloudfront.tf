resource "aws_cloudfront_distribution" "knowtfolio" {
  origin {
    domain_name = aws_s3_bucket.knowtfolio.bucket_regional_domain_name
    origin_id   = aws_s3_bucket.knowtfolio.id

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.knowtfolio.cloudfront_access_identity_path
    }
  }

  comment             = "CDN for knowtfolio static files hosting"
  enabled             = true
  is_ipv6_enabled     = false
  default_root_object = "index.html"

  aliases = [var.domain]

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    viewer_protocol_policy = "redirect-to-https"
    target_origin_id       = aws_s3_bucket.knowtfolio.id
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" // CachingOptimized
    compress               = true
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = false
    acm_certificate_arn            = aws_acm_certificate.knowtfolio.arn
    minimum_protocol_version       = "TLSv1.2_2018"
    ssl_support_method             = "sni-only"
  }
}

resource "aws_cloudfront_origin_access_identity" "knowtfolio" {
  comment = "origin access identity for s3"
}