resource "aws_iam_user" "knowtfolio_admin" {
  name = "knowtfolio_admin"
}

resource "aws_iam_access_key" "knowtfolio_admin" {
  user = aws_iam_user.knowtfolio_admin.name
}

resource "aws_iam_user_policy" "knowtfolio_nft_io" {
  name = "knowtfolio-nft-io"
  user = aws_iam_user.knowtfolio_admin.name
  policy = templatefile("${path.module}/templates/iam/s3_io_iam_policy.json", {
    resource = "${aws_s3_bucket.knowtfolio_resources.arn}/nfts/*"
  })
}