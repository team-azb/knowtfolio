resource "aws_codedeploy_app" "knowtfolio" {
  name = "knowtfolio"
}

resource "aws_codedeploy_deployment_group" "knowtfolio_backend" {
  app_name              = aws_codedeploy_app.knowtfolio.name
  deployment_group_name = "knowtfolio_backend"
  service_role_arn      = aws_iam_role.knowtfolio_code_deploy_backend.arn
  ec2_tag_set {
    ec2_tag_filter {
      key   = "Name"
      type  = "KEY_AND_VALUE"
      value = aws_instance.knowtfolio_backend.tags.Name
    }
  }
}
