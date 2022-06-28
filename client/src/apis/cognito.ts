import { CognitoUser } from "amazon-cognito-identity-js";
import * as AmazonCognitoIdentity from "amazon-cognito-identity-js";
import { userPool } from "~/configs/cognito";

export const signOutFromCognito = (cognitoUser: CognitoUser) => {
  return new Promise<void>((resolve) => {
    cognitoUser.signOut(() => {
      resolve();
    });
  });
};

export const signInToCognitoWithPassword = async (
  username: string,
  password: string
) => {
  const authenticationData = {
    Username: username,
    Password: password,
  };
  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
    authenticationData
  );
  const userData = {
    Username: username,
    Pool: userPool,
  };
  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  return new Promise<string>((resolve, reject) => {
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess(session) {
        const accessToken = session.getAccessToken().getJwtToken();
        resolve(accessToken);
      },
      onFailure(err) {
        reject(err.message || JSON.stringify(err));
      },
    });
  });
};

export type SignUpForm = {
  email: string;
  password: string;
  username: string;
  phoneNumber: string;
};

export const signUpToCognito = (form: SignUpForm) => {
  const attributeList = [
    new AmazonCognitoIdentity.CognitoUserAttribute({
      Name: "email",
      Value: form.email,
    }),
    new AmazonCognitoIdentity.CognitoUserAttribute({
      Name: "phone_number",
      Value: form.phoneNumber,
    }),
  ];
  return new Promise<AmazonCognitoIdentity.CognitoUser>((resolve, reject) => {
    userPool.signUp(
      form.username,
      form.password,
      attributeList,
      [],
      (err, result) => {
        if (err) {
          reject(err.message || JSON.stringify(err));
        }
        if (result) {
          const cognitoUser = result.user;
          resolve(cognitoUser);
        }
        reject("unexpected error");
      }
    );
  });
};

export const confirmSigningUpToCognito = (userName: string, code: string) => {
  const userData = {
    Username: userName,
    Pool: userPool,
  };
  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  return new Promise<unknown>((resolve, reject) => {
    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        reject(err.message || JSON.stringify(err));
      }
      resolve("call result: " + result);
    });
  });
};
