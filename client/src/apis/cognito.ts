import {
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserSession,
} from "amazon-cognito-identity-js";
import * as AmazonCognitoIdentity from "amazon-cognito-identity-js";
import { userPool } from "~/configs/cognito";
import Web3 from "web3";
import axios from "axios";

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

export const signInToCognitoWithWallet = async (
  username: string,
  web3: Web3,
  account: string
) => {
  const authenticationData = {
    Username: username,
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
    cognitoUser.setAuthenticationFlowType("CUSTOM_AUTH");
    cognitoUser.initiateAuth(authenticationDetails, {
      onSuccess(session) {
        const accessToken = session.getAccessToken().getJwtToken();
        resolve(accessToken);
      },
      onFailure(err) {
        reject(err.message || JSON.stringify(err));
      },
      customChallenge: async function (challengeParameters) {
        // User authentication depends on challenge response
        console.log(challengeParameters);
        const signedMessage = await web3.eth.personal.sign(
          challengeParameters["sign_message"],
          account,
          ""
        );
        cognitoUser.sendCustomChallengeAnswer(signedMessage, this);
      },
    });
  });
};

export type SignUpForm = {
  phone: string;
  password: string;
  username: string;
  wallet?: string;
};

export const signUpToCognito = async (form: SignUpForm) => {
  await axios.post("/api/signup", {
    username: form.username,
    password: form.password,
    phone_number: form.phone,
    wallet_address: form.wallet,
  });
};

export const confirmSigningUpToCognito = (username: string, code: string) => {
  const userData = {
    Username: username,
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

export const loadSession = (cognitoUser: CognitoUser) => {
  return new Promise<CognitoUserSession>((resolve, reject) => {
    cognitoUser.getSession((err: unknown, session: CognitoUserSession) => {
      if (err instanceof Error) {
        reject(err.message || JSON.stringify(err));
      }
      resolve(session);
    });
  });
};

export const loadAttributes = (cognitoUser: CognitoUser) => {
  return new Promise<CognitoUserAttribute[]>((resolve, reject) => {
    cognitoUser.getUserAttributes(function (err, result) {
      if (err) {
        reject(err.message || JSON.stringify(err));
      }
      if (result) {
        resolve(result);
      }
      reject("no attributes");
    });
  });
};
