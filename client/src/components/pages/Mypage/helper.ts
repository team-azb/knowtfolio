import { CognitoUser } from "amazon-cognito-identity-js";

export const signOutCognito = (cognitoUser: CognitoUser) => {
  return new Promise<void>((res) => {
    cognitoUser.signOut(() => {
      res();
    });
  });
};
