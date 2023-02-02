import axios from "axios";
import { SignUpFormKey } from "./cognito";

export type SignUpErrorCode = "invalid_format" | "already_exists";
type FieldError = {
  field_name: keyof signUpValidationForm;
  code: SignUpErrorCode;
};

type signUpValidationForm = {
  [key in SignUpFormKey]?: string;
};
export const validateSignUpForm = async (form: signUpValidationForm) => {
  const { confirm_password, ...reqBody } = form;
  const { data: errData } = await axios.post<FieldError[]>(
    "/api/validate_sign_up_form",
    reqBody
  );
  if (confirm_password !== reqBody.password) {
    errData.push({
      field_name: "confirm_password",
      code: "invalid_format",
    });
  }
  return errData;
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
