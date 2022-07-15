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

resource "aws_iam_role" "knowtfolio_article_writer" {
  name = "knowtfolio-article-writer"
  assume_role_policy = templatefile("${path.module}/src/templates/iam/knowtfolio_user_assume_policy.json", {
    aud = aws_cognito_identity_pool.knowtfolio.id
  })
}

resource "aws_iam_role_policy" "knowtfolio_put_article_images_policy" {
  name = "put-article-images-policy"
  role = aws_iam_role.knowtfolio_article_writer.name
  policy = templatefile("${path.module}/src/templates/iam/put_object_to_s3_policy.json", {
    resource = "${aws_s3_bucket.knowtfolio.arn}/images/*"
  })
}

resource "aws_iam_role" "knowtfolio_viewer" {
  name = "knowtfolio-viewer"
  assume_role_policy = templatefile("${path.module}/src/templates/iam/knowtfolio_user_assume_policy.json", {
    aud = aws_cognito_identity_pool.knowtfolio.id
  })
}