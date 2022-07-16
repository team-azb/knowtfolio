resource "aws_cognito_user_pool" "knowtfolio" {
  name = "dev-knowtfolio"
  admin_create_user_config {
    allow_admin_create_user_only = false
  }
  schema {
    name                = "email"
    attribute_data_type = "String"
    required            = true
    string_attribute_constraints {
      min_length = 0
      max_length = 2048
    }
  }

  schema {
    name                = "wallet_address"
    attribute_data_type = "String"
    mutable             = true
    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  auto_verified_attributes = ["email"]
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