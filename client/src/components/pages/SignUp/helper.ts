import {
  ConfirmSignUpCommand,
  ConfirmSignUpCommandInput,
  SignUpCommand,
  SignUpCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import { client, COGNITO_CLIENT_ID } from "../../../configs/cognito";

export type form = {
  email: string;
  password: string;
  username: string;
  phoneNumber: string;
};

export const signUpCognito = async (form: form) => {
  const input: SignUpCommandInput = {
    ClientId: COGNITO_CLIENT_ID,
    Password: form.password,
    UserAttributes: [
      {
        Name: "email",
        Value: form.email,
      },
      {
        Name: "phone_number",
        Value: form.phoneNumber,
      },
    ],
    Username: form.username,
  };
  const command = new SignUpCommand(input);
  await client.send(command);
};

export const confirmSignUpCognito = async (userName: string, code: string) => {
  const input: ConfirmSignUpCommandInput = {
    ClientId: COGNITO_CLIENT_ID,
    Username: userName,
    ConfirmationCode: code,
  };
  const command = new ConfirmSignUpCommand(input);
  await client.send(command);
};
