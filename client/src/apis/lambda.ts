import axios from "axios";
import { SignUpForm, SignUpFormKey } from "./cognito";

export type signUpErrorCode = "invalid_format" | "already_exists";
export type FieldError = {
  field_name: SignUpFormKey;
  code: signUpErrorCode;
};

export const validateSignUpForm = async (form: SignUpForm) => {
  // TODO: https://github.com/team-azb/knowtfolio/pull/174 とマージするときにエンドポイントを変更
  const { data: errData } = await axios.post("/api/validate_sign_up_form", form);
  return errData as FieldError[];
};

type postWalletForm = {
  userId: string;
  walletAddress: string;
  signature: string;
};
export const postWalletAddress = async (form: postWalletForm) => {
  await axios.post("/api/wallet_address", {
    user_id: form.userId,
    wallet_address: form.walletAddress,
    signature: form.signature,
  });
};
