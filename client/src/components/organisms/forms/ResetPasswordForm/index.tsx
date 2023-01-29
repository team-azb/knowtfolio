import { Button, Grid } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Form from "~/components/atoms/authForm/Form";
import Input from "~/components/atoms/authForm/Input";
import Spacer from "~/components/atoms/Spacer";
import { useAuthContext } from "~/components/organisms/providers/AuthProvider";
import { CreateFieldMessages } from "../SignUpForm";

export type ResetPasswordForm = {
  old_password: string;
  password: string;
  confirm_password: string;
};

type formFieldMessages = {
  [key in keyof ResetPasswordForm]?: JSX.Element;
};

/**
 * パスワードを再設定するためのフォーム
 */
const ResetPasswordForm = () => {
  const [resetPasswordForm, setResetPasswordForm] = useState<ResetPasswordForm>(
    {
      old_password: "",
      password: "",
      confirm_password: "",
    }
  );
  const [fieldMessages, setFieldMessages] = useState<formFieldMessages>({});
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmitForm = useCallback(() => {
    user.changePassword(
      resetPasswordForm.old_password,
      resetPasswordForm.password,
      (err) => {
        if (err) {
          console.error(err.message);
          toast.error("パスワードのアップデートに失敗しました。");
          return;
        }
        toast.success("パスワードを更新しました。");
      }
    );
  }, [resetPasswordForm.password, resetPasswordForm.old_password, user]);

  const handleChangeForm = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((event) => {
    switch (event.target.name) {
      case "password":
      case "old_password":
      case "confirm_password":
        setResetPasswordForm((prev) => {
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
      const fieldMessages = await CreateFieldMessages<ResetPasswordForm>(
        resetPasswordForm
      );
      setFieldMessages(fieldMessages);
    })();
  }, [resetPasswordForm]);

  return (
    <Form>
      <h2>パスワードを再設定する</h2>
      <hr />
      <Spacer height="3rem" />
      <Grid container spacing={3}>
        <Input
          name="old_password"
          id="old_password"
          onChange={handleChangeForm}
          value={resetPasswordForm.old_password}
          label="現在のパスワード"
          placeholder="現在使用しているパスワードを入力"
          type="password"
        />
        <Input
          name="password"
          id="password"
          onChange={handleChangeForm}
          value={resetPasswordForm.password}
          label="新しいパスワード"
          placeholder="新しく設定するパスワードを入力"
          type="password"
          message={fieldMessages.password}
        />
        <Input
          name="confirm_password"
          id="confirm_password"
          onChange={handleChangeForm}
          value={resetPasswordForm.confirm_password}
          label="新しいパスワード（確認用）"
          placeholder="新しく設定するパスワードを再度入力"
          type="password"
          message={fieldMessages.confirm_password}
        />
        <Grid item container justifyContent="center" spacing={2}>
          <Grid item>
            <Button
              variant="outlined"
              onClick={handleSubmitForm}
              style={{ fontSize: "1.4rem" }}
            >
              Submit
            </Button>
          </Grid>
          <Grid item>
            <Button
              onClick={() => {
                navigate("/mypage");
              }}
              variant="contained"
              style={{ fontSize: "1.4rem" }}
            >
              Cancel
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Form>
  );
};

export default ResetPasswordForm;
