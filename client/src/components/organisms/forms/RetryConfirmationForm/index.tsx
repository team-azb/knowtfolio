import { Button, Grid } from "@mui/material";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  confirmSigningUpToCognito,
  resendConfirmationCode,
} from "~/apis/cognito";
import Spacer from "~/components/atoms/Spacer";
import Form from "~/components/atoms/authForm/Form";
import Input from "~/components/atoms/authForm/Input";

const RetryConfirmationForm = () => {
  const [username, setUsername] = useState("");
  const [hasSentCode, setHasSentCode] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const navigate = useNavigate();

  const submitUsername = useCallback(async () => {
    try {
      await resendConfirmationCode(username);
      setHasSentCode(true);
      toast.success("確認コードを再送信しました。");
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "UserNotFoundException") {
          toast.error("指定のユーザーは存在しません。");
          return;
        }
        if (error.name === "LimitExceededException") {
          toast.error("時間をおいてから再度お試しください。");
          return;
        }
      }
      toast.error("確認コードの再送信に失敗しました。");
    }
  }, [username]);

  const verifyCode = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    async (event) => {
      event.preventDefault();
      try {
        await confirmSigningUpToCognito(username, confirmationCode);
        toast.success("確認コードの検証に成功しました。");
        navigate("/signin");
      } catch (error) {
        toast.error("確認コードの検証に失敗しました。");
        return;
      }
    },
    [confirmationCode, navigate, username]
  );

  return (
    <Form>
      <h2>確認コードの再送信</h2>
      <hr />
      <Spacer height="3rem" />
      <Grid item container spacing={3}>
        <Input
          name="username"
          id="username"
          onChange={(event) => {
            setUsername(event.target.value);
          }}
          placeholder="あなたのアカウントのユーザーネームを入力"
          value={username}
          label="Username"
          type="text"
          disabled={hasSentCode}
        />
        <Grid item container justifyContent="center">
          <Button
            variant="outlined"
            onClick={submitUsername}
            disabled={username.length === 0}
            style={{ fontSize: "1.4rem" }}
          >
            確認コードの再送信
          </Button>
        </Grid>
        {hasSentCode && (
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
                onChange={(event) => {
                  setConfirmationCode(event.target.value);
                }}
                value={confirmationCode}
                placeholder="登録されたメールアカウントに送信された確認コードを入力"
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
      </Grid>
    </Form>
  );
};

export default RetryConfirmationForm;
