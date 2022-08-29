locals {
  auth_challenge_func_dir        = "${path.module}/function_scripts/auth_challenge"
  define_auth_challenge_bin_path = "${local.auth_challenge_func_dir}/define"
  define_auth_challenge_zip_path = "${local.define_auth_challenge_bin_path}.zip"
  create_auth_challenge_bin_path = "${local.auth_challenge_func_dir}/create"
  create_auth_challenge_zip_path = "${local.create_auth_challenge_bin_path}.zip"
  verify_auth_challenge_bin_path = "${local.auth_challenge_func_dir}/verify"
  verify_auth_challenge_zip_path = "${local.verify_auth_challenge_bin_path}.zip"
}

data "archive_file" "define_auth_challenge" {
  type        = "zip"
  source_file = local.define_auth_challenge_bin_path
  output_path = local.define_auth_challenge_zip_path
  depends_on = [
    null_resource.build_go_functions
  ]
}

resource "aws_lambda_function" "define_auth_challenge" {
  function_name    = "define_auth_challenge"
  role             = aws_iam_role.knowtfolio_auth_challenge_lambda.arn
  filename         = data.archive_file.define_auth_challenge.output_path
  source_code_hash = data.archive_file.define_auth_challenge.output_base64sha256
  handler          = "define"
  runtime          = "go1.x"
}

resource "aws_lambda_permission" "define_auth_challenge" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.define_auth_challenge.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.knowtfolio.arn
}

data "archive_file" "create_auth_challenge" {
  type        = "zip"
  source_file = local.create_auth_challenge_bin_path
  output_path = local.create_auth_challenge_zip_path
  depends_on = [
    null_resource.build_go_functions
  ]
}

resource "aws_lambda_function" "create_auth_challenge" {
  function_name    = "create_auth_challenge"
  role             = aws_iam_role.knowtfolio_auth_challenge_lambda.arn
  filename         = data.archive_file.create_auth_challenge.output_path
  source_code_hash = data.archive_file.create_auth_challenge.output_base64sha256
  handler          = "create"
  runtime          = "go1.x"
}


data "archive_file" "verify_auth_challenge_response" {
  type        = "zip"
  source_file = local.verify_auth_challenge_bin_path
  output_path = local.verify_auth_challenge_zip_path
  depends_on = [
    null_resource.build_go_functions
  ]
}

resource "aws_lambda_function" "verify_auth_challenge_response" {
  function_name    = "verify_auth_challenge_response"
  role             = aws_iam_role.knowtfolio_auth_challenge_lambda.arn
  filename         = data.archive_file.verify_auth_challenge_response.output_path
  source_code_hash = data.archive_file.verify_auth_challenge_response.output_base64sha256
  handler          = "verify"
  runtime          = "go1.x"
}

resource "null_resource" "build_go_functions" {
  triggers = {
    code_diff = join("", [
      for file in ["cmd/define/main.go", "cmd/create/main.go", "cmd/verify/main.go"]
      : filebase64("${local.auth_challenge_func_dir}/${file}")
    ])
  }

  provisioner "local-exec" {
    command     = "go build ./cmd/define"
    working_dir = local.auth_challenge_func_dir
  }

  provisioner "local-exec" {
    command     = "go build ./cmd/create"
    working_dir = local.auth_challenge_func_dir
  }

  provisioner "local-exec" {
    command     = "go build ./cmd/verify"
    working_dir = local.auth_challenge_func_dir
  }
}
