resource "aws_cloudfront_distribution" "knowtfolio" {
  origin {
    domain_name = aws_s3_bucket.knowtfolio_client.bucket_regional_domain_name
    origin_id   = aws_s3_bucket.knowtfolio_client.id

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.knowtfolio_client.cloudfront_access_identity_path
    }
  }

  origin {
    domain_name = aws_s3_bucket.knowtfolio_nfts.bucket_regional_domain_name
    origin_id   = aws_s3_bucket.knowtfolio_nfts.id

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.knowtfolio_nfts.cloudfront_access_identity_path
    }
  }

  origin {
    domain_name = aws_s3_bucket.knowtfolio_article_resources.bucket_regional_domain_name
    origin_id   = aws_s3_bucket.knowtfolio_article_resources.id

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.knowtfolio_article_resources.cloudfront_access_identity_path
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
    target_origin_id       = aws_s3_bucket.knowtfolio_client.id
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" // CachingOptimized
    compress               = true
  }

  ordered_cache_behavior {
    path_pattern           = "/nfts/*"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    viewer_protocol_policy = "redirect-to-https"
    target_origin_id       = aws_s3_bucket.knowtfolio_nfts.id
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" // CachingOptimized
    compress               = true
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.append_dot_json.arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/images/*"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    viewer_protocol_policy = "redirect-to-https"
    target_origin_id       = aws_s3_bucket.knowtfolio_article_resources.id
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" // CachingOptimized
    compress               = true
  }

  # TODO: SPAのルーティングの方法について考え直す
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

resource "aws_cloudfront_origin_access_identity" "knowtfolio_client" {
  comment = "origin access identity for s3 knowtfolio-client"
}

resource "aws_cloudfront_origin_access_identity" "knowtfolio_nfts" {
  comment = "origin access identity for s3 knowtfolio-nfts"
}

resource "aws_cloudfront_origin_access_identity" "knowtfolio_article_resources" {
  comment = "origin access identity for s3 knowtfolio-article-resources"
}

resource "aws_cloudfront_function" "append_dot_json" {
  name    = "append_dot_json"
  runtime = "cloudfront-js-1.0"
  publish = true
  code    = file("${path.module}/function_scripts/appendDotJson.js")
}