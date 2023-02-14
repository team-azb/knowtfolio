import { Button, Grid } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  resetPassword,
  ResetPasswordForm,
  sendPassswordResetVerificationCode,
} from "~/apis/cognito";
import Form from "~/components/atoms/authForm/Form";
import Input from "~/components/atoms/authForm/Input";
import Spacer from "~/components/atoms/Spacer";
import { CreateFieldMessages } from "~/components/organisms/forms/helper";

type formFieldMessages = {
  [key in keyof ResetPasswordForm]?: JSX.Element;
};

/**
 * 検証コードを使用してパスワードを再設定するためのフォーム
 */
const ResetPasswordForm = () => {
  const [form, setForm] = useState<ResetPasswordForm>({
    username: "",
    password: "",
    password_confirmation: "",
    verification_code: "",
  });
  const [fieldMessages, setFieldMessages] = useState<formFieldMessages>({});
  const [hasSentCode, setHasSentCode] = useState(false);
  const navigate = useNavigate();

  const handleChangeForm = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((event) => {
    switch (event.target.name) {
      case "username":
      case "password":
      case "password_confirmation":
      case "verification_code":
        setForm((prev) => {
          return {
            ...prev,
            [event.target.name]: event.target.value,
          };
        });
        break;
      default:
        break;
    }
  }, []);

  useEffect(() => {
    (async () => {
      const { messages } = await CreateFieldMessages<ResetPasswordForm>(form);
      setFieldMessages(messages);
    })();
  }, [form]);

  const handleSubmitUsername = useCallback(async () => {
    try {
      await sendPassswordResetVerificationCode(form.username);
      setHasSentCode(true);
      toast.success("認証コードを送信しました。");
    } catch (error) {
      console.error(error);
      toast.error("認証コードの送信に失敗しました。");
    }
  }, [form.username]);

  const handleSubmitPasswordResetForm = useCallback(async () => {
    try {
      await resetPassword(form);
      toast.success("パスワードを再設定しました。");
      navigate("/signin");
    } catch (error) {
      console.error(error);
      toast.error("パスワードの再設定に失敗しました。");
    }
  }, [form, navigate]);

  return (
    <Form>
      <h2>パスワードを再設定する</h2>
      <hr />
      <Spacer height="3rem" />
      <Grid container spacing={3}>
        <Input
          name="username"
          id="username"
          onChange={handleChangeForm}
          value={form.username}
          label="Username"
          placeholder="ユーザーネームを入力"
          type="text"
          disabled={hasSentCode}
        />
        <Grid item container justifyContent="center" spacing={2}>
          <Button
            variant="outlined"
            disabled={hasSentCode}
            onClick={handleSubmitUsername}
            style={{ fontSize: "1.4rem" }}
          >
            確認コードを送信
          </Button>
        </Grid>
        {hasSentCode && (
          <>
            <Input
              name="verification_code"
              id="verification_code"
              onChange={handleChangeForm}
              value={form.verification_code}
              label="確認用コード"
              placeholder="送信した確認用コード"
              type="text"
              disabled={!hasSentCode}
            />
            <Input
              name="password"
              id="password"
              onChange={handleChangeForm}
              value={form.password}
              label="新しいパスワード"
              placeholder="新しく設定するパスワードを入力"
              type="password"
              disabled={!hasSentCode}
              message={fieldMessages.password}
            />
            <Input
              name="password_confirmation"
              id="password_confirmation"
              onChange={handleChangeForm}
              value={form.password_confirmation}
              label="新しいパスワード（確認用）"
              placeholder="新しく設定するパスワードを再度入力"
              type="password"
              disabled={!hasSentCode}
              message={fieldMessages.password_confirmation}
            />
            <Grid item container justifyContent="center" spacing={2}>
              <Button
                variant="outlined"
                disabled={!hasSentCode}
                onClick={handleSubmitPasswordResetForm}
                style={{ fontSize: "1.4rem" }}
              >
                Submit
              </Button>
            </Grid>
          </>
        )}
      </Grid>
    </Form>
  );
};

export default ResetPasswordForm;
