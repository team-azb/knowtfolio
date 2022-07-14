resource "aws_s3_bucket" "knowtfolio" {
  bucket = "dev-knowtfolio"
}

resource "aws_s3_bucket_versioning" "knowtfolio" {
  bucket = aws_s3_bucket.knowtfolio.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_acl" "knowtfolio" {
  bucket = aws_s3_bucket.knowtfolio.id
  acl    = "private"
}

resource "aws_s3_bucket_public_access_block" "knowtfolio" {
  bucket                  = aws_s3_bucket.knowtfolio.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_policy" "knowtfolio" {
  bucket = aws_s3_bucket.knowtfolio.id
  policy = templatefile("${path.module}/src/templates/s3/hosting_bucket_policy.json", {
    bucket     = aws_s3_bucket.knowtfolio.bucket
    identifier = aws_cloudfront_origin_access_identity.knowtfolio.iam_arn
  })
}

resource "aws_s3_bucket" "knowtfolio_resources" {
  bucket = "dev-knowtfolio-resources"
}

resource "aws_s3_bucket_versioning" "knowtfolio_resources" {
  bucket = aws_s3_bucket.knowtfolio_resources.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_acl" "knowtfolio_resources" {
  bucket = aws_s3_bucket.knowtfolio_resources.id
  acl    = "private"
}

resource "aws_s3_bucket_public_access_block" "knowtfolio_resources" {
  bucket                  = aws_s3_bucket.knowtfolio_resources.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_policy" "knowtfolio_resources" {
  bucket = aws_s3_bucket.knowtfolio_resources.id
  policy = templatefile("${path.module}/src/templates/s3/hosting_bucket_policy.json", {
    bucket     = aws_s3_bucket.knowtfolio_resources.bucket
    identifier = aws_cloudfront_origin_access_identity.knowtfolio_resources.iam_arn
  })
}