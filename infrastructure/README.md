# Knowtfolio
## Before starting
### 1. add knowtfolio profile to aws-cli configure and credentials
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
### 2. initialize terraform project
You can call the terraform operations as `make` targets. For more details, check `Makefile`.
```bash
# pwd: project-root (path/to/knowtfolio)
make init-tf
```
[Learn more about aws-cli profiles](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-configure-profiles.html)
## Usage
format tf files
```bash
make fmt-tf
```
check the changes, (not apply the changes to real AWS resources)
```bash
make plan-tf
```
apply the changes to real AWS resources
```bash
make apply-tf
```