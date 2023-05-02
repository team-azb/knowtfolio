import React, { useCallback, useEffect, useState } from "react";
import {
  signUpToCognito,
  SignUpForm,
  confirmSigningUpToCognito,
  signInToCognitoWithPassword,
  SignUpFormKey,
} from "~/apis/cognito";
import { Button, Grid } from "@mui/material";
import Input from "~/components/atoms/authForm/Input";
import Form from "~/components/atoms/authForm/Form";
import Spacer from "~/components/atoms/Spacer";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { CreateFieldMessages } from "~/components/organisms/forms/helper";

type formFieldMessages = {
  [key in SignUpFormKey]?: JSX.Element;
};

export const noteOnWalletAddress =
  "※一度連携したwallet addressは後から変更・削除できません。必ず正しいwallet addressが表示されているかどうかよく確認してから登録してください。";

const SignUpForm = () => {
  const [form, setForm] = useState<SignUpForm>({
    email: "",
    password: "",
    password_confirmation: "",
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
        case "email":
        case "password_confirmation":
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
      const fieldMessages = await CreateFieldMessages<SignUpForm>(form);
      setFieldMessages(fieldMessages);
    })();
  }, [form]);

  const submitForm = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    async (event) => {
      event.preventDefault();
      try {
        await signUpToCognito(form);
        setHasSignedUp(true);
        toast.success("登録したEmailにコードを送信しました。");
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
        navigate("/settings/wallet", {
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
        <Input
          label="Email"
          disabled={hasSignedUp}
          type="email"
          name="email"
          id="email"
          onChange={onChangeForm}
          value={form.email}
          placeholder="Email"
          message={fieldMessages.email}
        />
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
        <Input
          label="Confirm password"
          disabled={hasSignedUp}
          type="password"
          name="password_confirmation"
          id="password_confirmation"
          onChange={onChangeForm}
          value={form.password_confirmation}
          placeholder="Confirm password"
          message={fieldMessages.password_confirmation}
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
        <Grid item container direction="column" spacing={1}>
          <Grid item container justifyContent="center">
            すでにアカウントを持っている方は
            <Link to="/signin" style={{ color: "#000" }}>
              サインイン
            </Link>
            へ
          </Grid>
          <Grid item container justifyContent="center">
            確認コードの再送信は
            <Link to="/revalidation-code" style={{ color: "#000" }}>
              こちら
            </Link>
            へ
          </Grid>
        </Grid>
      </Grid>
    </Form>
  );
};

export default SignUpForm;
