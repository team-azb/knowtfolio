locals {
  func_script_root_dir = "${path.module}/function_scripts"

  golang_functions_dependencies = setunion(
    fileset(path.module, "function_scripts/pkg/**/*.go"),
    fileset(path.module, "../server/gateways/ethereum/**/*.go")
  )

  cognito_trigger_functions = {
    pre_sign_up                    = ""
    define_auth_challenge          = ""
    create_auth_challenge          = ""
    verify_auth_challenge_response = ""
  }
  auth_endpoint_functions = {
    validate_sign_up_form = {
      allow_methods     = ["POST"]
      api_resource_path = "validate_sign_up_form"
    }
    post_wallet_address = {
      allow_methods     = ["POST"]
      api_resource_path = "wallet_address"
    }
  }

  golang_functions = merge(
    local.cognito_trigger_functions,
    local.auth_endpoint_functions
  )
  lambda_functions = local.golang_functions
}

resource "null_resource" "golang_functions_to_s3" {
  for_each = local.golang_functions
  triggers = {
    code_diff = base64sha256(join("", [
      for file in setunion(
        ["${local.func_script_root_dir}/cmd/${each.key}/main.go"],
        local.golang_functions_dependencies
      ) : filesha256(file)
    ]))
  }

  provisioner "local-exec" {
    # NOTE: In order to make the `code_diff` trigger work,
    # we need to zip the binary and upload it to s3 without using data.archived_file or data.aws_s3_object.
    # We also need to upload the hash of the zip file to fill aws_lambda_function.source_code_hash.
    # Ref: https://dev.classmethod.jp/articles/deploy-golang-lambda-function-with-terraform
    command = <<EOT
      go build -o ./bin/${each.key} ./cmd/${each.key}

      zip -j ./archive/${each.key}.zip ./bin/${each.key}
      openssl dgst -sha256 -binary ./archive/${each.key}.zip | openssl enc -base64 | tr -d \"\n\" > ./archive/${each.key}.zip.base64sha256

      aws s3 cp ./archive/${each.key}.zip s3://${aws_s3_bucket.lambda_artifacts.bucket} --profile=knowtfolio
      aws s3 cp ./archive/${each.key}.zip.base64sha256 s3://${aws_s3_bucket.lambda_artifacts.bucket} --profile=knowtfolio --content-type "text/plain"
    EOT

    working_dir = local.func_script_root_dir
    environment = {
      GOARCH = "amd64"
      GOOS   = "linux"
      # NOTE: lambdaの環境下でも動作させるために設定。
      # https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/golang-package.html#golang-package-mac-linux
      CGO_ENABLED                 = 0
      AWS_CONFIG_FILE             = abspath("${path.module}/.aws/config")
      AWS_SHARED_CREDENTIALS_FILE = abspath("${path.module}/.aws/credentials")
    }
  }
}

data "aws_s3_object" "golang_function_zip" {
  for_each = local.golang_functions
  bucket   = aws_s3_bucket.lambda_artifacts.bucket
  key      = "${each.key}.zip"
  depends_on = [
    null_resource.golang_functions_to_s3
  ]
}

data "aws_s3_object" "golang_function_zip_hash" {
  for_each = local.golang_functions
  bucket   = aws_s3_bucket.lambda_artifacts.bucket
  key      = "${each.key}.zip.base64sha256"
  depends_on = [
    null_resource.golang_functions_to_s3
  ]
}

resource "aws_lambda_function" "cognito_triggers" {
  for_each         = local.cognito_trigger_functions
  function_name    = each.key
  role             = aws_iam_role.lambda[each.key].arn
  s3_bucket        = aws_s3_bucket.lambda_artifacts.bucket
  s3_key           = data.aws_s3_object.golang_function_zip[each.key].key
  source_code_hash = data.aws_s3_object.golang_function_zip_hash[each.key].body
  handler          = each.key
  runtime          = "go1.x"
}

resource "aws_lambda_function" "auth_endpoints" {
  for_each         = local.auth_endpoint_functions
  function_name    = each.key
  role             = aws_iam_role.lambda[each.key].arn
  s3_bucket        = aws_s3_bucket.lambda_artifacts.bucket
  s3_key           = data.aws_s3_object.golang_function_zip[each.key].key
  source_code_hash = data.aws_s3_object.golang_function_zip_hash[each.key].body
  handler          = each.key
  runtime          = "go1.x"

  environment {
    variables = {
      COGNITO_USER_POOL_ID = aws_cognito_user_pool.knowtfolio.id
      COGNITO_CLIENT_ID    = aws_cognito_user_pool_client.knowtfolio.id
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
