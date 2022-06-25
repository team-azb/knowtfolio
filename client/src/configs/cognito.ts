import * as AmazonCognitoIdentity from "amazon-cognito-identity-js";

export const COGNITO_USER_POOL_ID = process.env.USER_POOL_ID || "";
export const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID || "";

export const userPool = new AmazonCognitoIdentity.CognitoUserPool({
  UserPoolId: COGNITO_USER_POOL_ID,
  ClientId: COGNITO_CLIENT_ID,
});
