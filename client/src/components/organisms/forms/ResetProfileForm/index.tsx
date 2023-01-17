import { Button, Grid } from "@mui/material";
import Form from "~/components/atoms/authForm/Form";
import Spacer from "~/components/atoms/Spacer";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Input from "~/components/atoms/authForm/Input";
import Label from "~/components/atoms/authForm/Label";
import TextareaAutosize from "@mui/base/TextareaAutosize";
import { grey } from "@mui/material/colors";
import { useAuthContext } from "~/components/organisms/providers/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";

const ResetProfileForm = () => {
  const { user, attributes } = useAuthContext();
  const phoneNumber = useMemo(() => {
    return attributes.find((atr) => atr.Name === "phone_number")?.Value;
  }, [attributes]);
  const navigate = useNavigate();
  return (
    <Form>
      <h2>プロフィールを編集</h2>
      <hr />
      <Spacer height="3rem" />
      <Grid container direction="row" spacing={5}>
        <Grid item>
          <Button variant="text" style={{ fontSize: 14, padding: 0 }}>
            <AccountCircleIcon sx={{ fontSize: 150 }} />
          </Button>
        </Grid>
        <Grid item flexGrow={1}>
          <Grid container direction="column" spacing={2}>
            <Grid item container direction="column">
              <Label>Username</Label>
              <Grid item>{user.getUsername()}</Grid>
            </Grid>
            <Grid item container direction="column">
              <Label>Phone number</Label>
              <Grid item>{phoneNumber}</Grid>
            </Grid>
            <Input
              name="email"
              id="email"
              label="Email"
              type="text"
              placeholder="メールアドレスを入力"
            />
            <Input
              name="website"
              id="website"
              label="Website"
              type="text"
              placeholder="プロフィールがわかるウェブサイトを入力"
            />
            <Grid item container direction="column">
              <Label htmlFor="description">Biography</Label>
              <TextareaAutosize
                minRows={3}
                name="description"
                id="description"
                placeholder="自己紹介を入力"
                style={{
                  fontSize: "1.5rem",
                  border: `1px solid ${grey[500]}`,
                  borderRadius: 3,
                  paddingLeft: 5,
                  resize: "none",
                }}
              />
            </Grid>
            <Grid item container justifyContent="center" spacing={3}>
              <Grid item>
                <Button variant="outlined" style={{ fontSize: "1.4rem" }}>
                  update
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  style={{ fontSize: "1.4rem" }}
                  onClick={() => navigate("/mypage")}
                >
                  cancel
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Form>
  );
};

export default ResetProfileForm;
