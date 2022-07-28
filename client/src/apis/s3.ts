import { PutObjectCommand } from "@aws-sdk/client-s3";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { COGNITO_USER_POOL_ID } from "~/configs/cognito";
import {
  COGNITO_IDENTITY_POOL_ID,
  getS3Client,
  ARTICLE_RESOURCES_S3_BUCEKT,
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
    Bucket: ARTICLE_RESOURCES_S3_BUCEKT,
    Key: key,
    Body: blob,
  });
};
