import axios from "axios";
import { SignUpForm, SignUpFormKey } from "./cognito";

export type signUpErrorCode = "invalid_format" | "already_exists";
export type FieldError = {
  field_name: SignUpFormKey;
  code: signUpErrorCode;
};

export const validateSignUpForm = async (form: SignUpForm) => {
  // TODO: https://github.com/team-azb/knowtfolio/pull/174 とマージするときにエンドポイントを変更
  const { data: errData } = await axios.post("/api/validate_signup_form", form);
  return errData as FieldError[];
};
