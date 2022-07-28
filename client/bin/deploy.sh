#!/bin/bash
set -e 
CLIENT_S3_BUCEKT=$(grep CLIENT_S3_BUCEKT .env | cut -d '=' -f2)
CLOUD_FRONT_DISTRIBUTION_ID=$(grep CLOUD_FRONT_DISTRIBUTION_ID .env | cut -d '=' -f2)

aws s3 sync ./dist s3://$CLIENT_S3_BUCEKT --exact-timestamps --profile=knowtfolio
echo Successfully uploaded build files to s3! s3 bucket name: $CLIENT_S3_BUCEKT
aws cloudfront create-invalidation --distribution-id $CLOUD_FRONT_DISTRIBUTION_ID --paths "/*" --profile=knowtfolio
echo Successfully remove cache! distribution id: $CLOUD_FRONT_DISTRIBUTION_ID