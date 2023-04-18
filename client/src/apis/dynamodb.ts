import {
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandInput,
} from "@aws-sdk/client-dynamodb";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { COGNITO_USER_POOL_ID } from "~/configs/cognito";
import { COGNITO_IDENTITY_POOL_ID } from "~/configs/s3";

/**
 * idTokenを使ってdynamodbクライアントを初期化する
 * @param idToken ログイン済みcognitoユーザーのidToken
 * @returns dynamodbクライアント
 */
export const initDynamodbClient = (idToken: string) => {
  const credentialProvider = fromCognitoIdentityPool({
    identityPoolId: COGNITO_IDENTITY_POOL_ID,
    logins: {
      [`cognito-idp.ap-northeast-1.amazonaws.com/${COGNITO_USER_POOL_ID}`]:
        idToken,
    },
    clientConfig: {
      region: "ap-northeast-1",
    },
  });
  return new DynamoDBClient({
    credentials: credentialProvider,
    region: "ap-northeast-1",
  });
};

/**
 * userIdからwalletAddressを取得する
 * @param client dynamodbクライアント
 * @param userId ユーザーid
 * @returns walletAddress
 */
export const fetchWalletAddress = async (
  client: DynamoDBClient,
  userId: string
) => {
  const params: GetItemCommandInput = {
    TableName: "knowtfolio",
    Key: {
      type: { S: "user_id_to_wallet_address" },
      key: { S: userId },
    },
  };
  const command = new GetItemCommand(params);
  const resp = await client.send(command);
  return resp.Item?.wallet_address?.S;
};

/**
 * userIdからnonceを取得する
 * @param client dynamodbクライアント
 * @param userId ユーザーid
 * @returns nonce
 */
export const fetchNonce = async (client: DynamoDBClient, userId: string) => {
  const params: GetItemCommandInput = {
    TableName: "knowtfolio",
    Key: {
      type: { S: "user_id_to_nonce" },
      key: { S: userId },
    },
  };
  const command = new GetItemCommand(params);
  const resp = await client.send(command);
  const value = resp.Item?.value?.S;
  if (value) {
    return value;
  } else {
    JSON.stringify(params);
    console.log(
      `value not found ${JSON.stringify(params)} ${JSON.stringify(resp)}`
    );
    return "";
  }
};
