import { Button, Grid } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { validateSignUpForm } from "~/apis/lambda";
import Form from "~/components/atoms/authForm/Form";
import Input from "~/components/atoms/authForm/Input";
import Spacer from "~/components/atoms/Spacer";
import { useAuthContext } from "~/components/organisms/providers/AuthProvider";
import { MessagesOnInvalidFormError } from "../SignUpForm";

/**
 * パスワードを再設定するためのフォーム
 */
const ResetPasswordForm = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [fieldMessage, setFieldMessage] = useState<JSX.Element>();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmitForm = useCallback(() => {
    user.changePassword(oldPassword, newPassword, (err) => {
      if (err) {
        console.error(err.message);
        toast.error("パスワードのアップデートに失敗しました。");
        return;
      }
      toast.success("パスワードを更新しました。");
    });
  }, [newPassword, oldPassword, user]);

  useEffect(() => {
    (async () => {
      if (newPassword) {
        const errors = await validateSignUpForm({
          password: newPassword,
        });
        if (errors.find((err) => err.field_name === "password")) {
          setFieldMessage(
            <span style={{ color: "red" }}>
              {MessagesOnInvalidFormError.password}
            </span>
          );
        } else {
          setFieldMessage(
            <span style={{ color: "green" }}>有効な値です。</span>
          );
        }
      }
    })();
  }, [newPassword]);

  return (
    <Form>
      <h2>パスワードを再設定する</h2>
      <hr />
      <Spacer height="3rem" />
      <Grid container spacing={3}>
        <Input
          name="oldPassword"
          id="oldPassword"
          onChange={(event) => {
            setOldPassword(event.target.value);
          }}
          value={oldPassword}
          label="Old password"
          type="password"
        />
        <Input
          name="newPassword"
          id="newPassword"
          onChange={(event) => {
            setNewPassword(event.target.value);
          }}
          value={newPassword}
          label="New password"
          type="password"
          message={fieldMessage}
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
