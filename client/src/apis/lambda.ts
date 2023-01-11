import axios from "axios";
import { SignUpForm } from "./cognito";

export type signUpErrorCode = "invalid_format" | "already_exists";
export type FieldError = {
  field_name: string;
  code: signUpErrorCode;
};

export const validateSignUpForm = async (form: SignUpForm) => {
  const { data: errData } = await axios.post("/api/validate_signup_form", {
    username: form.username,
    password: form.password,
    phone_number: form.phone,
    wallet_address: form.wallet,
  });
  return errData as FieldError[];
};
