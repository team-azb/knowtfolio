locals {
  func_script_root_dir           = "${path.module}/function_scripts"
  auth_challenge_func_dir        = "${local.func_script_root_dir}/auth_challenge"
  define_auth_challenge_bin_path = "${local.auth_challenge_func_dir}/define"
  define_auth_challenge_zip_path = "${local.define_auth_challenge_bin_path}.zip"
  create_auth_challenge_bin_path = "${local.auth_challenge_func_dir}/create"
  create_auth_challenge_zip_path = "${local.create_auth_challenge_bin_path}.zip"
  verify_auth_challenge_bin_path = "${local.auth_challenge_func_dir}/verify"
  verify_auth_challenge_zip_path = "${local.verify_auth_challenge_bin_path}.zip"
  sign_up_func_dir               = "${local.func_script_root_dir}/sign_up"
  sign_up_bin_path               = "${local.sign_up_func_dir}/sign_up"
  sign_up_zip_path               = "${local.sign_up_bin_path}.zip"
}

data "archive_file" "define_auth_challenge" {
  type        = "zip"
  source_file = local.define_auth_challenge_bin_path
  output_path = local.define_auth_challenge_zip_path
  depends_on = [
    null_resource.build_go_auth_challenge_functions
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
    null_resource.build_go_auth_challenge_functions
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

resource "aws_lambda_permission" "create_auth_challenge" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.create_auth_challenge.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.knowtfolio.arn
}


data "archive_file" "verify_auth_challenge_response" {
  type        = "zip"
  source_file = local.verify_auth_challenge_bin_path
  output_path = local.verify_auth_challenge_zip_path
  depends_on = [
    null_resource.build_go_auth_challenge_functions
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

resource "aws_lambda_permission" "verify_auth_challenge_response" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.verify_auth_challenge_response.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.knowtfolio.arn
}

data "archive_file" "sign_up" {
  type        = "zip"
  source_file = local.sign_up_bin_path
  output_path = local.sign_up_zip_path
  depends_on = [
    null_resource.build_go_sign_up_function
  ]
}

resource "aws_lambda_function" "knowtfolio_sign_up" {
  function_name    = "knowtfolio_sign_up"
  role             = aws_iam_role.knowtfolio_sign_up_lambda.arn
  filename         = data.archive_file.sign_up.output_path
  source_code_hash = data.archive_file.sign_up.output_base64sha256
  handler          = "sign_up"
  runtime          = "go1.x"
  environment {
    variables = {
      USER_POOL_ID = aws_cognito_user_pool.knowtfolio.id
      CLIENT_ID    = aws_cognito_user_pool_client.knowtfolio.id
    }
  }
}

resource "aws_lambda_function_url" "knowtfolio_sign_up" {
  function_name      = aws_lambda_function.knowtfolio_sign_up.function_name
  authorization_type = "NONE"
  cors {
    # MEMO: 開発用にlocalhostを許容している。環境で分けるようになった場合は、本番環境ではこれは除く必要がある。
    allow_origins = ["https://knowtfolio.com", "http://localhost:3000"]
    allow_methods = ["GET", "POST", "DELETE"]
  }
}

resource "null_resource" "build_go_sign_up_function" {
  triggers = {
    code_diff = filebase64("${local.sign_up_func_dir}/main.go")
  }

  provisioner "local-exec" {
    command     = "go build -o sign_up main.go"
    working_dir = local.sign_up_func_dir
    environment = {
      GOARCH = "amd64"
      GOOS   = "linux"
      # MEMO: lambdaの環境下でも動作させるために設定
      # https://github.com/team-azb/knowtfolio/issues/115
      CGO_ENABLED = 0
    }
  }
}

resource "null_resource" "build_go_auth_challenge_functions" {
  triggers = {
    code_diff = join("", [
      for file in ["cmd/define/main.go", "cmd/create/main.go", "cmd/verify/main.go"]
      : filebase64("${local.auth_challenge_func_dir}/${file}")
    ])
  }

  provisioner "local-exec" {
    command     = "go build ./cmd/define"
    working_dir = local.auth_challenge_func_dir
    environment = {
      GOARCH = "amd64"
      GOOS   = "linux"
      # MEMO: lambdaの環境下でも動作させるために設定
      # https://github.com/team-azb/knowtfolio/issues/115
      CGO_ENABLED = 0
    }
  }

  provisioner "local-exec" {
    command     = "go build ./cmd/create"
    working_dir = local.auth_challenge_func_dir
    environment = {
      GOARCH = "amd64"
      GOOS   = "linux"
      # MEMO: lambdaの環境下でも動作させるために設定
      # https://github.com/team-azb/knowtfolio/issues/115
      CGO_ENABLED = 0
    }
  }

  provisioner "local-exec" {
    command     = "go build ./cmd/verify"
    working_dir = local.auth_challenge_func_dir
    environment = {
      GOARCH = "amd64"
      GOOS   = "linux"
      # MEMO: lambdaの環境下でも動作させるために設定
      # https://github.com/team-azb/knowtfolio/issues/115
      CGO_ENABLED = 0
    }
  }
}
