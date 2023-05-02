import { Button, Grid } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Form from "~/components/atoms/authForm/Form";
import Input from "~/components/atoms/authForm/Input";
import Spacer from "~/components/atoms/Spacer";
import { useAuthContext } from "~/components/organisms/providers/AuthProvider";
import { ValidateForm } from "~/components/organisms/forms/helper";

export type UpdatePasswordForm = {
  old_password: string;
  password: string;
  password_confirmation: string;
};

export type UpdatePasswordValidationForm = Omit<
  UpdatePasswordForm,
  "old_password"
>;

type formFieldMessages = {
  [key in keyof UpdatePasswordForm]?: JSX.Element;
};

/**
 * 現在のパスワードを使用してパスワードを更新するためのフォーム
 */
const UpdatePasswordForm = () => {
  const [updatePasswordForm, setUpdatePasswordForm] =
    useState<UpdatePasswordForm>({
      old_password: "",
      password: "",
      password_confirmation: "",
    });
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [fieldMessages, setFieldMessages] = useState<formFieldMessages>({});
  const [canSubmitForm, setCanSubmitForm] = useState(false);

  useEffect(() => {
    (async () => {
      const { fieldMessages, canSubmitForm } = await ValidateForm({
        password: updatePasswordForm.password,
        password_confirmation: updatePasswordForm.password_confirmation,
      });
      setFieldMessages(fieldMessages);
      setCanSubmitForm(canSubmitForm);
    })();
  }, [updatePasswordForm]);

  const handleSubmitForm = useCallback(() => {
    user.changePassword(
      updatePasswordForm.old_password,
      updatePasswordForm.password,
      (err) => {
        if (err) {
          console.error(err.message);
          toast.error("パスワードのアップデートに失敗しました。");
          return;
        }
        toast.success("パスワードを更新しました。");
      }
    );
  }, [updatePasswordForm.password, updatePasswordForm.old_password, user]);

  const handleChangeForm = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((event) => {
    switch (event.target.name) {
      case "password":
      case "old_password":
      case "password_confirmation":
        setUpdatePasswordForm((prev) => {
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
          value={updatePasswordForm.old_password}
          label="現在のパスワード"
          placeholder="現在使用しているパスワードを入力"
          type="password"
        />
        <Input
          name="password"
          id="password"
          onChange={handleChangeForm}
          value={updatePasswordForm.password}
          label="新しいパスワード"
          placeholder="新しく設定するパスワードを入力"
          type="password"
          message={fieldMessages.password}
        />
        <Input
          name="password_confirmation"
          id="password_confirmation"
          onChange={handleChangeForm}
          value={updatePasswordForm.password_confirmation}
          label="新しいパスワード（確認用）"
          placeholder="新しく設定するパスワードを再度入力"
          type="password"
          message={fieldMessages.password_confirmation}
        />
        <Grid item container justifyContent="center" spacing={2}>
          <Grid item>
            <Button
              variant="outlined"
              onClick={handleSubmitForm}
              disabled={!canSubmitForm}
              style={{ fontSize: "1.4rem" }}
            >
              Submit
            </Button>
          </Grid>
          <Grid item>
            <Button
              onClick={() => {
                navigate(`/users/${user.getUsername()}`);
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

export default UpdatePasswordForm;
