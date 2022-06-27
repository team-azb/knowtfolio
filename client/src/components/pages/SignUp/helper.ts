import * as AmazonCognitoIdentity from "amazon-cognito-identity-js";
import { userPool } from "~/configs/cognito";

export type form = {
  email: string;
  password: string;
  username: string;
  phoneNumber: string;
};

export const signUpCognito = (form: form) => {
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
  return new Promise<AmazonCognitoIdentity.CognitoUser>((res, rej) => {
    userPool.signUp(
      form.username,
      form.password,
      attributeList,
      [],
      (err, result) => {
        if (err) {
          rej(err.message || JSON.stringify(err));
        }
        if (result) {
          const cognitoUser = result.user;
          res(cognitoUser);
        }
        rej("unexpected error");
      }
    );
  });
};

export const confirmSignUpCognito = (userName: string, code: string) => {
  const userData = {
    Username: userName,
    Pool: userPool,
  };
  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  return new Promise<unknown>((res, rej) => {
    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        rej(err.message || JSON.stringify(err));
      }
      res("call result: " + result);
    });
  });
};
