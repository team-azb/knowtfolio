resource "random_id" "external_id" {
  byte_length = 12
}

resource "aws_cognito_user_pool" "knowtfolio" {
  name = "dev-knowtfolio"
  admin_create_user_config {
    allow_admin_create_user_only = false
  }
  schema {
    name                = "phone_number"
    attribute_data_type = "String"
    required            = true
    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  lambda_config {
    pre_sign_up                    = aws_lambda_function.cognito_triggers["pre_sign_up"].arn
    define_auth_challenge          = aws_lambda_function.cognito_triggers["define_auth_challenge"].arn
    create_auth_challenge          = aws_lambda_function.cognito_triggers["create_auth_challenge"].arn
    verify_auth_challenge_response = aws_lambda_function.cognito_triggers["verify_auth_challenge_response"].arn
  }

  sms_configuration {
    sns_caller_arn = aws_iam_role.cognito_sms_sender.arn
    external_id    = random_id.external_id.id
  }

  auto_verified_attributes = ["phone_number"]
}

resource "aws_cognito_user_pool_client" "knowtfolio" {
  name = "dev-knowtfolio-client"

  user_pool_id = aws_cognito_user_pool.knowtfolio.id
}

resource "aws_cognito_identity_pool" "knowtfolio" {
  identity_pool_name               = "dev-knowtfolio-user-identity-pool"
  allow_unauthenticated_identities = false

  cognito_identity_providers {
    client_id     = aws_cognito_user_pool_client.knowtfolio.id
    provider_name = "cognito-idp.ap-northeast-1.amazonaws.com/${aws_cognito_user_pool.knowtfolio.id}"
  }
}

resource "aws_cognito_identity_pool_roles_attachment" "knowtfolio" {
  identity_pool_id = aws_cognito_identity_pool.knowtfolio.id
  roles = {
    "authenticated"   = aws_iam_role.knowtfolio_article_writer.arn
    "unauthenticated" = aws_iam_role.knowtfolio_viewer.arn
  }
}