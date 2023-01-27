import { Button, Grid } from "@mui/material";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import Form from "~/components/atoms/authForm/Form";
import Input from "~/components/atoms/authForm/Input";
import Spacer from "~/components/atoms/Spacer";
import { useAuthContext } from "~/components/organisms/providers/AuthProvider";

/**
 * パスワードを再設定するためのフォーム
 */
const ResetPasswordForm = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const { user } = useAuthContext();

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
        />
        <Grid item container justifyContent="center">
          <Button
            variant="outlined"
            onClick={handleSubmitForm}
            style={{ fontSize: "1.4rem" }}
          >
            Submit
          </Button>
        </Grid>
      </Grid>
    </Form>
  );
};

export default ResetPasswordForm;
