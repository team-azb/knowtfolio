import React, { useCallback, useEffect, useState } from "react";
import {
  signUpToCognito,
  SignUpForm,
  confirmSigningUpToCognito,
  signInToCognitoWithPassword,
  SignUpFormKey,
} from "~/apis/cognito";
import PhoneInput from "react-phone-number-input/input";
import { E164Number } from "libphonenumber-js/types";
import { Button, Grid } from "@mui/material";
import Input, { InputStyle } from "~/components/atoms/authForm/Input";
import Label from "~/components/atoms/authForm/Label";
import Form from "~/components/atoms/authForm/Form";
import Spacer from "~/components/atoms/Spacer";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { signUpErrorCode, validateSignUpForm } from "~/apis/lambda";

type formFieldMessages = {
  [key in SignUpFormKey]?: JSX.Element;
};

/**
 * invalid_formだった場合のエラー表示文
 */
const messagesOnInvalidFormError = {
  username: "適切なユーザーネームではありません。",
  password: "大文字・小文字・数字・記号を含む８文字以上である必要があります。",
  phone_number:
    "適切な電話番号ではありません。（日本国以外の電話番号は利用できません。）",
  wallet_address: "適切なwallet addressではありません。",
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
const createFieldMessages = async (form: SignUpForm) => {
  const keys = Object.keys(form) as SignUpFormKey[];
  const fieldErrors = await validateSignUpForm(form);
  const validFieldMessage = (
    <span style={{ color: "green" }}>有効な値です。</span>
  );

  const messages = keys
    .filter((key) => form[key]) //入力のない項目についてはメッセージを表示しない
    .reduce((msgs, key) => {
      const fieldErr = fieldErrors.find((err) => err.field_name == key);
      msgs[key] = fieldErr
        ? translateSignUpErrorCode(
            fieldErr.field_name,
            fieldErr.code,
            form[key]
          )
        : validFieldMessage;
      return msgs;
    }, {} as formFieldMessages);

  return messages;
};

export const noteOnWalletAddress =
  "※一度連携したwallet addressは後から変更・削除できません。必ず正しいwallet addressが表示されているかどうかよく確認してから登録してください。";

const SignUpForm = () => {
  const [form, setForm] = useState<SignUpForm>({
    phone_number: "",
    password: "",
    username: "",
  });
  const [fieldMessages, setFieldMessages] = useState<formFieldMessages>({});
  const [hasSignedUp, setHasSignedUp] = useState(false);
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const onChangeForm = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      switch (event.target.name) {
        case "password":
        case "username":
          setForm((prev) => {
            return { ...prev, [event.target.name]: event.target.value };
          });
          break;
        default:
          break;
      }
    },
    []
  );

  useEffect(() => {
    (async () => {
      const fieldMessages = await createFieldMessages(form);
      setFieldMessages(fieldMessages);
    })();
  }, [form]);

  const onChangePhoneNumberInput = useCallback((value: E164Number) => {
    setForm((prev) => {
      return {
        ...prev,
        phone_number: value,
      };
    });
  }, []);

  const submitForm = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    async (event) => {
      event.preventDefault();
      try {
        await signUpToCognito(form);
        setHasSignedUp(true);
        toast.success("登録した電話番号にコードを送信しました。");
      } catch (error) {
        // TODO: Display user friendly error.
        toast.error(`sign up failed: ${error}`);
      }
    },
    [form]
  );

  const onChangeCodeInput = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((event) => {
    setCode(event.target.value);
  }, []);

  const verifyCode = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    async (event) => {
      event.preventDefault();
      try {
        await confirmSigningUpToCognito(form.username, code);
        toast.success("認証コードの検証に成功しました。");
      } catch (error) {
        toast.error("認証コードの検証に失敗しました。");
        return;
      }

      try {
        await signInToCognitoWithPassword(form.username, form.password);
        toast.success("サインインしました。");
        navigate("/register-wallet", {
          state: {
            shouldLoadCurrentUser: true,
          },
        });
      } catch (error) {
        toast.error("サインインに失敗しました。");
      }
    },
    [form.username, form.password, code, navigate]
  );

  return (
    <Form>
      <h2>サインアップ</h2>
      <hr />
      <Spacer height="3rem" />
      <Grid container direction="column" spacing={3}>
        <Input
          label="Username"
          disabled={hasSignedUp}
          type="text"
          name="username"
          id="username"
          onChange={onChangeForm}
          placeholder="Name used as display name"
          message={fieldMessages.username}
        />
        <Grid item container direction="column">
          <Label htmlFor="phone_number">Phone number</Label>
          <PhoneInput
            onChange={onChangePhoneNumberInput}
            country="JP"
            id="phone_number"
            name="phone_number"
            disabled={hasSignedUp}
            value={form.phone_number}
            style={InputStyle}
            placeholder="Phone number"
          />
          <label htmlFor="phone_number" style={{ color: "red" }}>
            {fieldMessages.phone_number}
          </label>
        </Grid>
        <Input
          label="Password"
          disabled={hasSignedUp}
          type="password"
          name="password"
          id="password"
          onChange={onChangeForm}
          value={form.password}
          placeholder="Password"
          message={fieldMessages.password}
        />
        <Grid item container justifyContent="center">
          <Button
            variant="outlined"
            disabled={hasSignedUp}
            onClick={submitForm}
            style={{ fontSize: "1.4rem" }}
          >
            Submit
          </Button>
        </Grid>
        {hasSignedUp && (
          <Grid
            item
            container
            justifyContent="center"
            alignItems="center"
            spacing={1}
          >
            <Grid item>
              <Input
                type="text"
                name="confirmation_code"
                id="confirmation_code"
                onChange={onChangeCodeInput}
                value={code}
                placeholder="Confirmation code"
              />
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                onClick={verifyCode}
                style={{ fontSize: "1.4rem" }}
              >
                verify
              </Button>
            </Grid>
          </Grid>
        )}
        <Grid item container justifyContent="center">
          <p>
            すでにアカウントを持っている方は
            <Link to="/signin" style={{ color: "#000" }}>
              サインイン
            </Link>
            へ
          </p>
        </Grid>
      </Grid>
    </Form>
  );
};

export default SignUpForm;
