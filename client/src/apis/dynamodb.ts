import {
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandInput,
} from "@aws-sdk/client-dynamodb";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { COGNITO_USER_POOL_ID } from "~/configs/cognito";
import { COGNITO_IDENTITY_POOL_ID } from "~/configs/s3";

/**
 * jwtTokenを使ってdynamodbクライアントを初期化する
 * @param jwtToken ログイン済みユーザーのjwtトークン
 * @returns dynamodbクライアント
 */
export const initDynamodbClientWithJwtToken = (jwtToken: string) => {
  const credentialProvider = fromCognitoIdentityPool({
    identityPoolId: COGNITO_IDENTITY_POOL_ID,
    logins: {
      [`cognito-idp.ap-northeast-1.amazonaws.com/${COGNITO_USER_POOL_ID}`]:
        jwtToken,
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
    TableName: "user_to_wallet",
    Key: {
      user_id: { S: userId },
    },
  };
  const command = new GetItemCommand(params);
  const resp = await client.send(command);
  const walletAddress = resp.Item?.wallet_address.S;
  if (walletAddress) {
    return walletAddress;
  } else {
    throw new Error("wallet addressが登録されていません。");
  }
};
