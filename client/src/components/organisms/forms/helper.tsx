import {
  ResetPasswordValidationForm,
  SignUpForm,
  SignUpFormKey,
} from "~/apis/cognito";
import { SignUpErrorCode, validateSignUpForm } from "~/apis/lambda";
import { UpdatePasswordValidationForm } from "~/components/organisms/forms/UpdatePasswordForm";

/**
 * invalid_formだった場合のエラー表示文
 */
const messagesOnInvalidFormError = {
  username:
    "小文字・数字・ハイフンのみを含む３９文字以内の文字列である必要があります。（ハイフンは頭と末尾に来てはいけません。）",
  password:
    "大文字・小文字・数字・記号を含む８文字以上の文字列である必要があります。",
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
 * フォームを検証し、エラーメッセージと検証結果を返却する
 * @param form 検証するフォーム
 * @returns エラーメッセージと検証結果
 */
export const ValidateForm = async <
  T extends
    | SignUpForm
    | UpdatePasswordValidationForm
    | ResetPasswordValidationForm
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

  const isAllFieldsFilled = Object.values(form).every(
    (value) => value.length > 0
  );

  return {
    fieldMessages: messages,
    canSubmitForm: isFormValid && isAllFieldsFilled,
  };
};
