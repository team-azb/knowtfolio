import {
  ResetPasswordValidationForm,
  SignUpForm,
  SignUpFormKey,
} from "~/apis/cognito";
import { SignUpErrorCode, validateSignUpForm } from "~/apis/lambda";
import { UpdatePasswordForm } from "~/components/organisms/forms/UpdatePasswordForm";

/**
 * invalid_formだった場合のエラー表示文
 */
const messagesOnInvalidFormError = {
  username: "適切なユーザーネームではありません。",
  password: "大文字・小文字・数字・記号を含む８文字以上である必要があります。",
  email: "適切なEmailアドレスではありません。",
  wallet_address: "適切なwallet addressではありません。",
  password_confirmation: "パスワードが一致していません。",
} as const;

/**
 * signUpFormのエラーコードをエラー表示用のJSX Elementに変換する
 * messagesOnInvalidFormErrorに依存関係あり
 * @param field 対象のフィールド
 * @param errorCode エラーコード
 * @param value フィールドの値
 * @returns エラー表示用のJSX Element
 */
const translateSignUpErrorCode = (
  field: SignUpFormKey,
  errorCode: SignUpErrorCode,
  value: string
) => {
  if (errorCode === "already_exists") {
    return (
      <span style={{ color: "red" }}>
        <b>{value}</b>はすでに登録されています。
      </span>
    );
  } else {
    return (
      <span style={{ color: "red" }}>{messagesOnInvalidFormError[field]}</span>
    );
  }
};

/**
 * フィールドに表示するメッセージを作成するための関数
 * @param form サインアップフォーム
 */
export const CreateFieldMessages = async <
  T extends SignUpForm | UpdatePasswordForm | ResetPasswordValidationForm
>(
  form: T
) => {
  type fieldMessage = {
    [key in keyof T]?: JSX.Element;
  };
  const keys = Object.keys(form) as (keyof T)[];
  const fieldErrors = await validateSignUpForm(form);
  const validFieldMessage = (
    <span style={{ color: "green" }}>有効な値です。</span>
  );

  let isFormValid = true;
  const messages = keys
    .filter((key) => form[key]) //入力のない項目についてはメッセージを表示しない
    .reduce((msgs, key) => {
      const fieldErr = fieldErrors.find((err) => err.field_name == key);
      if (fieldErr) {
        msgs[key] = translateSignUpErrorCode(
          fieldErr.field_name,
          fieldErr.code,
          String(form[key])
        );
        isFormValid = false;
      } else {
        msgs[key] = validFieldMessage;
      }
      return msgs;
    }, {} as fieldMessage);

  return { messages, isFormValid };
};
