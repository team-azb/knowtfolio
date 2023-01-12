import React, { useCallback, useEffect, useState } from "react";
import {
  signUpToCognito,
  SignUpForm,
  confirmSigningUpToCognito,
  signInToCognitoWithPassword,
  SignUpFormKey,
} from "~/apis/cognito";
import { useWeb3Context } from "~/components/organisms/providers/Web3Provider";
import PhoneInput from "react-phone-number-input/input";
import { E164Number } from "libphonenumber-js/types";
import { AxiosError } from "axios";
import { Button, Grid } from "@mui/material";
import Input, { InputStyle } from "~/components/atoms/authForm/Input";
import Label from "~/components/atoms/authForm/Label";
import Checkbox from "~/components/atoms/authForm/Checkbox";
import Form from "~/components/atoms/authForm/Form";
import Spacer from "~/components/atoms/Spacer";
import WalletAddressDisplay from "~/components/organisms/WalletAddressDisplay";
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
  }
  // invalida_formだった場合のエラーメッセージ
  return (
    <span style={{ color: "red" }}>{messagesOnInvalidFormError[field]}</span>
  );
};

const createFieldMessages = async (form: SignUpForm) => {
  // 値が入力されているものについてのみメッセージ表示の対応
  const messagesWhenValid = (
    Object.keys(form) as SignUpFormKey[]
  ).reduce<formFieldMessages>((obj, key) => {
    if (form[key]) {
      obj[key] = <span style={{ color: "green" }}>有効な値です。</span>;
    }
    return obj;
  }, {});

  // バリデーションエラーが起きているフィールドのメッセージを上書きする
  const fieldErrors = await validateSignUpForm(form);
  return fieldErrors.reduce<formFieldMessages>((obj, { field_name, code }) => {
    const value = form[field_name];
    // 値が入力されているものについてのみエラー表示の対象
    if (value) {
      obj[field_name] = translateSignUpErrorCode(field_name, code, value);
    }
    return obj;
  }, messagesWhenValid);
};

const SignUpForm = () => {
  const [form, setForm] = useState<SignUpForm>({
    phone_number: "",
    password: "",
    username: "",
  });
  const [fieldMessages, setFieldMessages] = useState<formFieldMessages>({});
  const [hasSignedUp, setHasSignedUp] = useState(false);
  const [code, setCode] = useState("");
  const { account } = useWeb3Context();
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
        case "wallet_address":
          if (event.target.checked) {
            setForm((prev) => {
              return { ...prev, wallet_address: account };
            });
          } else {
            setForm((prev) => {
              return { ...prev, wallet_address: undefined };
            });
          }
          break;
        default:
          break;
      }
    },
    [account]
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
        navigate("/mypage", {
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
        <Checkbox
          id="wallet_address"
          name="wallet_address"
          disabled={hasSignedUp}
          onChange={onChangeForm}
          label={
            <>
              <WalletAddressDisplay
                address={account}
                style={{ display: "inline" }}
              />
              をwallet addressとして登録する(option)
            </>
          }
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
