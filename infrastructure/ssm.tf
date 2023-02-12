resource "aws_ssm_parameter" "db_name" {
  name  = "/dev/db/name"
  type  = "String"
  value = "knowtfolio_db"
}

resource "aws_ssm_parameter" "db_user" {
  name  = "/dev/db/user"
  type  = "String"
  value = "admin"
}

resource "aws_ssm_parameter" "db_address" {
  name  = "/dev/db/address"
  type  = "String"
  value = aws_db_instance.knowtfolio_db.address
}

resource "random_password" "db_password" {
  length  = 20
  special = false
}

resource "aws_ssm_parameter" "db_password" {
  name  = "/dev/db/password"
  type  = "SecureString"
  value = random_password.db_password.result
}