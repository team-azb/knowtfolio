resource "aws_cognito_user_pool" "knowfolio" {
  name = "knowtfolio"
  admin_create_user_config {
    allow_admin_create_user_only = false
  }
  schema {
    name                = "email"
    attribute_data_type = "String"
    required            = true
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