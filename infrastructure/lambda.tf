locals {
  func_script_root_dir = "${path.module}/function_scripts"

  cognito_trigger_functions = {
    pre_sign_up                    = ""
    post_confirmation              = ""
    define_auth_challenge          = ""
    create_auth_challenge          = ""
    verify_auth_challenge_response = ""
  }
  auth_endpoint_functions = {
    validate_sign_up_form = {
      allow_methods = ["POST"]
      resource_name = "validate_sign_up_form"
    }
    put_wallet_address = {
      allow_methods = ["PUT"]
      resource_name = "wallet_address"
    }
  }

  golang_functions = merge(
    local.cognito_trigger_functions,
    local.auth_endpoint_functions
  )
  lambda_functions = local.golang_functions
}

resource "null_resource" "build_golang_functions" {
  for_each = local.golang_functions
  triggers = {
    // code_diff = filebase64("${local.func_script_root_dir}/cmd/${each.key}/main.go")
    always_run = timestamp()
  }

  provisioner "local-exec" {
    command     = "go build -o ./bin/${each.key} ./cmd/${each.key}"
    working_dir = local.func_script_root_dir
    environment = {
      GOARCH = "amd64"
      GOOS   = "linux"
      # NOTE: lambdaの環境下でも動作させるために設定。
      # https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/golang-package.html#golang-package-mac-linux
      CGO_ENABLED = 0
    }
  }
}

data "archive_file" "zipped_golang_functions" {
  for_each    = local.golang_functions
  type        = "zip"
  source_file = "${local.func_script_root_dir}/bin/${each.key}"
  output_path = "${local.func_script_root_dir}/archive/${each.key}.zip"
  depends_on = [
    null_resource.build_golang_functions
  ]
}

resource "aws_lambda_function" "cognito_triggers" {
  for_each         = local.cognito_trigger_functions
  function_name    = each.key
  role             = aws_iam_role.lambda[each.key].arn
  filename         = data.archive_file.zipped_golang_functions[each.key].output_path
  source_code_hash = data.archive_file.zipped_golang_functions[each.key].output_base64sha256
  handler          = each.key
  runtime          = "go1.x"
}

resource "aws_lambda_function" "auth_endpoints" {
  for_each         = local.auth_endpoint_functions
  function_name    = each.key
  role             = aws_iam_role.lambda[each.key].arn
  filename         = data.archive_file.zipped_golang_functions[each.key].output_path
  source_code_hash = data.archive_file.zipped_golang_functions[each.key].output_base64sha256
  handler          = each.key
  runtime          = "go1.x"

  environment {
    variables = {
      USER_POOL_ID = aws_cognito_user_pool.knowtfolio.id
      CLIENT_ID    = aws_cognito_user_pool_client.knowtfolio.id
    }
  }
}

resource "aws_lambda_permission" "cognito_triggers" {
  for_each      = local.cognito_trigger_functions
  action        = "lambda:InvokeFunction"
  function_name = each.key
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.knowtfolio.arn
}

resource "aws_lambda_function_url" "auth_endpoints" {
  for_each           = local.auth_endpoint_functions
  function_name      = aws_lambda_function.auth_endpoints[each.key].function_name
  authorization_type = "NONE"
  cors {
    # NOTE: 開発用にlocalhostを許容している。環境で分けるようになった場合は、本番環境ではこれは除く必要がある。
    allow_origins = ["https://knowtfolio.com", "http://localhost:3000"]
    allow_methods = each.value.allow_methods
  }
}
