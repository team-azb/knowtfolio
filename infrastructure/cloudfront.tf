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

  origin {
    domain_name = aws_lb.knowtfolio_backend.dns_name
    origin_id   = aws_lb.knowtfolio_backend.id

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1"]
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

  ordered_cache_behavior {
    path_pattern             = "/api/*"
    allowed_methods          = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods           = ["GET", "HEAD", "OPTIONS"]
    viewer_protocol_policy   = "allow-all"
    target_origin_id         = aws_lb.knowtfolio_backend.id
    cache_policy_id          = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad" // CachingDisabled
    origin_request_policy_id = "216adef6-5c7f-47e4-b989-5492eafa07d3" // AllViewer
    compress                 = true
  }

  ordered_cache_behavior {
    path_pattern             = "/articles/new"
    allowed_methods          = ["GET", "HEAD"]
    cached_methods           = ["GET", "HEAD"]
    viewer_protocol_policy   = "allow-all"
    target_origin_id         = aws_s3_bucket.knowtfolio_client.id
    cache_policy_id          = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad" // CachingDisabled
    origin_request_policy_id = "216adef6-5c7f-47e4-b989-5492eafa07d3" // AllViewer
    compress                 = true
  }

  ordered_cache_behavior {
    path_pattern             = "/articles/*/edit"
    allowed_methods          = ["GET", "HEAD"]
    cached_methods           = ["GET", "HEAD"]
    viewer_protocol_policy   = "allow-all"
    target_origin_id         = aws_s3_bucket.knowtfolio_client.id
    cache_policy_id          = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad" // CachingDisabled
    origin_request_policy_id = "216adef6-5c7f-47e4-b989-5492eafa07d3" // AllViewer
    compress                 = true
  }

  ordered_cache_behavior {
    path_pattern             = "/articles/*"
    allowed_methods          = ["GET", "HEAD"]
    cached_methods           = ["GET", "HEAD"]
    viewer_protocol_policy   = "allow-all"
    target_origin_id         = aws_lb.knowtfolio_backend.id
    cache_policy_id          = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad" // CachingDisabled
    origin_request_policy_id = "216adef6-5c7f-47e4-b989-5492eafa07d3" // AllViewer
    compress                 = true
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