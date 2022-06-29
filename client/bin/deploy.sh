#!/bin/bash
set -e 
S3_BUCKET_NAME_TO_DEPLOY=$(grep S3_BUCKET_NAME_TO_DEPLOY .env | cut -d '=' -f2)
CLOUD_FRONT_DISTRIBUTION_ID=$(grep CLOUD_FRONT_DISTRIBUTION_ID .env | cut -d '=' -f2)

aws s3 sync ./dist s3://$S3_BUCKET_NAME_TO_DEPLOY --exact-timestamps --profile=knowtfolio
echo Successfully uploaded build files to s3! s3 bucket name: $S3_BUCKET_NAME_TO_DEPLOYwq
aws cloudfront create-invalidation --distribution-id $CLOUD_FRONT_DISTRIBUTION_ID --paths "/*" --profile=knowtfolio
echo Successfully remove cache! distribution id: $CLOUD_FRONT_DISTRIBUTION_ID