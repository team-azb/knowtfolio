import axios from "axios";
import { SignUpFormKey } from "./cognito";

export type signUpErrorCode = "invalid_format" | "already_exists";
export type FieldError = {
  field_name: SignUpFormKey;
  code: signUpErrorCode;
};

type signUpValidationForm = {
  [key in SignUpFormKey]?: string;
};
export const validateSignUpForm = async (form: signUpValidationForm) => {
  const { data: errData } = await axios.post(
    "/api/validate_sign_up_form",
    form
  );
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
