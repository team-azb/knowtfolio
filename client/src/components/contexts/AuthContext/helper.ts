import {
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserSession,
} from "amazon-cognito-identity-js";

export const getSession = (cognitoUser: CognitoUser) => {
  return new Promise<CognitoUserSession>((res, rej) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cognitoUser.getSession((err: any, session: CognitoUserSession) => {
      if (err) {
        rej(err.message || JSON.stringify(err));
      }
      res(session);
    });
  });
};

export const getAttributes = (cognitoUser: CognitoUser) => {
  return new Promise<CognitoUserAttribute[]>((res, rej) => {
    cognitoUser.getUserAttributes(function (err, result) {
      if (err) {
        rej(err.message || JSON.stringify(err));
      }
      if (result) {
        res(result);
      }
      rej("no attributes");
    });
  });
};
