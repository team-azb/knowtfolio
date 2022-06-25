import * as AmazonCognitoIdentity from "amazon-cognito-identity-js";
import { userPool } from "../../../configs/cognito";

export type SignInWithPasswordForm = {
  username: string;
  password: string;
};

export const signInCognitoWithPassword = async (
  form: SignInWithPasswordForm
) => {
  const authenticationData = {
    Username: form.username,
    Password: form.password,
  };
  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
    authenticationData
  );
  const userData = {
    Username: form.username,
    Pool: userPool,
  };
  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  return new Promise<string>((res, rej) => {
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess(session) {
        const accessToken = session.getAccessToken().getJwtToken();
        res(accessToken);
      },
      onFailure(err) {
        rej(err.message || JSON.stringify(err));
      },
    });
  });
};
