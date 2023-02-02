import { Button, Grid } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  resetPasswordWithCode,
  ResetPasswordWithCodeForm,
  sendPassswordResetCode,
} from "~/apis/cognito";
import Form from "~/components/atoms/authForm/Form";
import Input from "~/components/atoms/authForm/Input";
import Spacer from "~/components/atoms/Spacer";
import { CreateFieldMessages } from "~/components/organisms/forms/helper";

type formFieldMessages = {
  [key in keyof ResetPasswordWithCodeForm]?: JSX.Element;
};

const ResetPasswordWithCode = () => {
  const [form, setForm] = useState<ResetPasswordWithCodeForm>({
    username: "",
    password: "",
    confirm_password: "",
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
      case "confirm_password":
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
      const fieldMessages =
        await CreateFieldMessages<ResetPasswordWithCodeForm>(form);
      setFieldMessages(fieldMessages);
    })();
  }, [form]);

  const handleSubmitUsername = useCallback(async () => {
    try {
      await sendPassswordResetCode(form.username);
      setHasSentCode(true);
      toast.success("認証コードを送信しました。");
    } catch (error) {
      console.error(error);
      toast.error("認証コードの送信に失敗しました。");
    }
  }, [form.username]);

  const handleSubmitPasswordResetForm = useCallback(async () => {
    try {
      await resetPasswordWithCode(form);
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
              name="confirm_password"
              id="confirm_password"
              onChange={handleChangeForm}
              value={form.confirm_password}
              label="新しいパスワード（確認用）"
              placeholder="新しく設定するパスワードを再度入力"
              type="password"
              disabled={!hasSentCode}
              message={fieldMessages.confirm_password}
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

export default ResetPasswordWithCode;
