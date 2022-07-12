# Knowtfolio
## Before starting
### 1. install aws-cli and terraform
- install `aws-cli`  
doc: https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/getting-started-install.html
- install `terraform`  
  ```
  version: v1.1.7
  provider registry.terraform.io/hashicorp/aws v4.11.0
  ```
  doc: https://learn.hashicorp.com/tutorials/terraform/install-cli

### 2. add knowtfolio profile to aws-cli configure and credentials
The private key and the access key are managed by using profile of aws-cli. profile name is "knowtfolio" and the following is set in the configuration file of aws-cli.  
`<project-root>/infrastructure/.aws/config`
```
[profile knowtfolio]
region = ap-northeast-1
output = json
```
`<project-root>/infrastructure/.aws/credentials`
```
[knowtfolio]
aws_access_key_id = <your-access-key>
aws_secret_access_key = <your-secret-access-key>
```
### 3. initialize terraform project
```
terraform init
```
[Learn more about aws-cli profiles](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-configure-profiles.html)
## Usage
format tf files
```
terraform fmt
```
check the changes, (not apply the changes to real AWS resources)
```
terraform plan
```
apply the changes to real AWS resources
```
terraform apply
```