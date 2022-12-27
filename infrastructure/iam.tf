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
    resource = "${aws_s3_bucket.knowtfolio_nfts.arn}/nfts/*"
  })
}

data "aws_iam_policy_document" "backend_test" {
  statement {
    actions = [
      "cognito-idp:*",
    ]
    resources = [
      "${aws_cognito_user_pool.knowtfolio.arn}*",
    ]
  }
  statement {
    actions = [
      "dynamodb:*",
    ]
    resources = [
      "${aws_dynamodb_table.user_to_wallet.arn}*",
    ]
  }
}

resource "aws_iam_user_policy" "backend_test" {
  name   = "backend-test"
  user   = aws_iam_user.knowtfolio_admin.name
  policy = data.aws_iam_policy_document.backend_test.json
}

resource "aws_iam_role" "knowtfolio_article_writer" {
  name = "knowtfolio-article-writer"
  assume_role_policy = templatefile("${path.module}/templates/iam/knowtfolio_user_assume_policy.json", {
    aud = aws_cognito_identity_pool.knowtfolio.id
  })
}

resource "aws_iam_role_policy" "knowtfolio_put_article_images_policy" {
  name = "put-article-images-policy"
  role = aws_iam_role.knowtfolio_article_writer.name
  policy = templatefile("${path.module}/templates/iam/put_object_to_s3_policy.json", {
    resource = "${aws_s3_bucket.knowtfolio_article_resources.arn}/images/*"
  })
}

resource "aws_iam_role" "knowtfolio_viewer" {
  name = "knowtfolio-viewer"
  assume_role_policy = templatefile("${path.module}/templates/iam/knowtfolio_user_assume_policy.json", {
    aud = aws_cognito_identity_pool.knowtfolio.id
  })
}

resource "aws_iam_role" "knowtfolio_auth_challenge_lambda" {
  name               = "knowtfolio-lambda-auth-challenge"
  assume_role_policy = file("${path.module}/templates/iam/knowtfolio_auth_challenge_lambda_assume_policy.json")
}

resource "aws_iam_role_policy" "basic_lambda_policy" {
  name = "basic-lambda-policy"
  role = aws_iam_role.knowtfolio_auth_challenge_lambda.name
  policy = templatefile("${path.module}/templates/iam/basic_lambda_policy.json", {
    user_to_wallet_table_arn = aws_dynamodb_table.user_to_wallet.arn
  })
}

resource "aws_iam_role" "cognito_sms_sender" {
  name = "cognito-sms-sender"
  assume_role_policy = templatefile("${path.module}/templates/iam/cognito_sms_sender_assume_policy.json", {
    external_id = random_id.external_id.id
  })
}

resource "aws_iam_role_policy" "sns_publish" {
  name   = "sns-publish"
  role   = aws_iam_role.cognito_sms_sender.name
  policy = file("${path.module}/templates/iam/sns_publish_policy.json")
}

resource "aws_iam_role" "knowtfolio_sign_up_lambda" {
  name               = "knowtfolio-sign-up-lambda"
  assume_role_policy = file("${path.module}/templates/iam/knowtfolio_auth_challenge_lambda_assume_policy.json")
}

resource "aws_iam_role_policy" "knowtfolio_sign_up_with_cognito" {
  name = "knowtfolio-sign-up-with-cognito"
  role = aws_iam_role.knowtfolio_sign_up_lambda.name
  policy = templatefile("${path.module}/templates/iam/basic_lambda_policy.json", {
    user_to_wallet_table_arn = aws_dynamodb_table.user_to_wallet.arn
  })
}

resource "aws_iam_role_policy" "cognito_user_creation_via_lambda" {
  name = "cognito-yesuser-yescreation-yesvia-yeslambda"
  role = aws_iam_role.knowtfolio_sign_up_lambda.name
  policy = templatefile("${path.module}/templates/iam/create_cognito_user_policy.json", {
    resource_arn = aws_cognito_user_pool.knowtfolio.arn
  })
}

resource "aws_iam_role" "code_deploy_backend" {
  name               = "code-deploy-backend"
  assume_role_policy = file("${path.module}/templates/iam/code_deploy/assume_policy.json")
}

resource "aws_iam_role_policy_attachment" "aws_code_deploy_role" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSCodeDeployRole"
  role       = aws_iam_role.code_deploy_backend.name
}

resource "aws_iam_role" "backend" {
  name               = "knowtfolio-backend"
  assume_role_policy = file("${path.module}/templates/iam/ec2/assume_policy.json")
}

resource "aws_iam_role_policy" "fetch_build_artifacts" {
  name = "knowtfolio"
  role = aws_iam_role.backend.name
  policy = templatefile("${path.module}/templates/iam/ec2/knowtfolio_backend_policy.json", {
    bucket = aws_s3_bucket.code_deploy.arn
  })
}