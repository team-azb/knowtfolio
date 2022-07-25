resource "aws_s3_bucket" "knowtfolio_client" {
  bucket = "dev-knowtfolio-client"
}

resource "aws_s3_bucket_versioning" "knowtfolio_client" {
  bucket = aws_s3_bucket.knowtfolio_client.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_acl" "knowtfolio_client" {
  bucket = aws_s3_bucket.knowtfolio_client.id
  acl    = "private"
}

resource "aws_s3_bucket_public_access_block" "knowtfolio_client" {
  bucket                  = aws_s3_bucket.knowtfolio_client.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_policy" "knowtfolio_client" {
  bucket = aws_s3_bucket.knowtfolio_client.id
  policy = templatefile("${path.module}/templates/s3/hosting_bucket_policy.json", {
    bucket     = aws_s3_bucket.knowtfolio_client.bucket
    identifier = aws_cloudfront_origin_access_identity.knowtfolio_client.iam_arn
  })
}

resource "aws_s3_bucket" "knowtfolio_nfts" {
  bucket = "dev-knowtfolio-nfts"
}

resource "aws_s3_bucket_versioning" "knowtfolio_nfts" {
  bucket = aws_s3_bucket.knowtfolio_nfts.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_acl" "knowtfolio_nfts" {
  bucket = aws_s3_bucket.knowtfolio_nfts.id
  acl    = "private"
}

resource "aws_s3_bucket_public_access_block" "knowtfolio_nfts" {
  bucket                  = aws_s3_bucket.knowtfolio_nfts.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_policy" "knowtfolio_nfts" {
  bucket = aws_s3_bucket.knowtfolio_nfts.id
  policy = templatefile("${path.module}/templates/s3/hosting_bucket_policy.json", {
    bucket     = aws_s3_bucket.knowtfolio_nfts.bucket
    identifier = aws_cloudfront_origin_access_identity.knowtfolio_nfts.iam_arn
  })
}

resource "aws_s3_bucket_cors_configuration" "knowtfolio" {
  bucket = aws_s3_bucket.knowtfolio_client.bucket

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST"]
    allowed_origins = ["https://knowtfolio.com", "http://localhost:3000"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }

  cors_rule {
    allowed_methods = ["GET"]
    allowed_origins = ["*"]
  }
}