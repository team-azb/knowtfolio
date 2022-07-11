resource "aws_s3_bucket" "knowtfolio" {
  bucket = "knowtfolio"
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

  depends_on = [aws_s3_bucket.knowtfolio]
}

resource "aws_s3_bucket_policy" "knowtfolio" {
  bucket = aws_s3_bucket.knowtfolio.id
  policy = templatefile("${path.module}/templates/s3/hosting_bucket_policy.json", {
    bucket     = aws_s3_bucket.knowtfolio.bucket
    identifier = aws_cloudfront_origin_access_identity.knowtfolio.iam_arn
  })
  depends_on = [
    aws_s3_bucket.knowtfolio,
    aws_cloudfront_origin_access_identity.knowtfolio
  ]
}