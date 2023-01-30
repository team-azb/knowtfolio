import { SignUpForm, SignUpFormKey } from "~/apis/cognito";
import { signUpErrorCode, validateSignUpForm } from "~/apis/lambda";
import { ResetPasswordForm } from "~/components/organisms/forms/ResetPasswordForm";

/**
 * invalid_formだった場合のエラー表示文
 */
const messagesOnInvalidFormError = {
  username: "適切なユーザーネームではありません。",
  password: "大文字・小文字・数字・記号を含む８文字以上である必要があります。",
  phone_number:
    "適切な電話番号ではありません。（日本国以外の電話番号は利用できません。）",
  wallet_address: "適切なwallet addressではありません。",
  confirm_password: "パスワードが一致していません。",
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
  errorCode: signUpErrorCode,
  value: string
) => {
  if (errorCode === "already_exists") {
    return (
      <span style={{ color: "red" }}>
        <b>{value}</b>はすでに登録されています。
      </span>
    );
  }
  // invalida_formだった場合のエラーメッセージ
  return (
    <span style={{ color: "red" }}>{messagesOnInvalidFormError[field]}</span>
  );
};

/**
 * フィールドに表示するメッセージを作成するための関数
 * @param form サインアップフォーム
 */
export const CreateFieldMessages = async <
  T extends SignUpForm | ResetPasswordForm
>(
  form: T
) => {
  type fieldMessage = {
    [key in keyof T]?: JSX.Element;
  };
  // 値が入力されているものについてのみメッセージ表示の対応
  const initMessage = (Object.keys(form) as (keyof T)[]).reduce<fieldMessage>(
    (obj, key) => {
      if (form[key]) {
        obj[key] = <span style={{ color: "green" }}>有効な値です。</span>;
      }
      return obj;
    },
    {}
  );
  // バリデーションエラーが起きているフィールドのメッセージを上書きする
  const fieldErrors = await validateSignUpForm(form);
  return fieldErrors.reduce<fieldMessage>((obj, { field_name, code }) => {
    if ("username" in form) {
      const value = form[field_name];

      // 値が入力されているものについてのみエラー表示の対象
      if (value) {
        obj[field_name as keyof T] = translateSignUpErrorCode(
          field_name,
          code,
          value
        );
      }
    } else if (field_name === "password" || field_name === "confirm_password") {
      const value = form[field_name];
      // 値が入力されているものについてのみエラー表示の対象
      if (value) {
        obj[field_name] = translateSignUpErrorCode(field_name, code, value);
      }
    }
    return obj;
  }, initMessage);
};
