import { PutObjectCommand } from "@aws-sdk/client-s3";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { COGNITO_USER_POOL_ID } from "~/configs/cognito";
import {
  COGNITO_IDENTITY_POOL_ID,
  getS3Client,
  S3_BUCKET_NAME_TO_DEPLOY,
} from "~/configs/s3";

export const getS3ClientWithCognitoJwtToken = (jwtToken: string) => {
  return getS3Client(
    fromCognitoIdentityPool({
      identityPoolId: COGNITO_IDENTITY_POOL_ID,
      logins: {
        [`cognito-idp.ap-northeast-1.amazonaws.com/${COGNITO_USER_POOL_ID}`]:
          jwtToken,
      },
      clientConfig: {
        region: "ap-northeast-1",
      },
    })
  );
};

export const createPutImageObjectCommand = (key: string, blob: Blob) => {
  return new PutObjectCommand({
    Bucket: S3_BUCKET_NAME_TO_DEPLOY,
    Key: key,
    Body: blob,
  });
};
