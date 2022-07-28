import { S3Client } from "@aws-sdk/client-s3";
import { Credentials, Provider } from "@aws-sdk/types"; // ES6 import

export const COGNITO_IDENTITY_POOL_ID =
  process.env.COGNITO_IDENTITY_POOL_ID || "";

export const ARTICLE_RESOURCES_S3_BUCEKT =
  process.env.ARTICLE_RESOURCES_S3_BUCEKT || "";

export const getS3Client = (
  credentials: Credentials | Provider<Credentials>
) => {
  return new S3Client({
    region: "ap-northeast-1",
    credentials: credentials,
  });
};
