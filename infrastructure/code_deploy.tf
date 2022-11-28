resource "aws_codedeploy_app" "backend" {
  name = "knowtfolio"
}

resource "aws_codedeploy_deployment_group" "backend" {
  app_name              = aws_codedeploy_app.backend.name
  deployment_group_name = "backend"
  service_role_arn      = aws_iam_role.code_deploy_backend.arn
  ec2_tag_set {
    ec2_tag_filter {
      key   = "Name"
      type  = "KEY_AND_VALUE"
      value = aws_instance.knowtfolio_backend.tags.Name
    }
  }
}
