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
import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { CognitoUserAttribute } from "amazon-cognito-identity-js";

type profileForm = {
  email?: string;
  website?: string;
  description?: string;
};

const convertToCognitoKey = (value: keyof profileForm) => {
  if (value === "description") {
    return `custom:${value}`;
  }
  return value;
};

const ResetProfileForm = () => {
  const {
    user,
    attributes: { phoneNumber, email, website, description },
  } = useAuthContext();
  const [profileForm, setProfileForm] = useState<profileForm>({
    email,
    website,
    description,
  });
  const navigate = useNavigate();

  const handleSubmitForm = useCallback(() => {
    const attributes = (Object.keys(profileForm) as (keyof profileForm)[]).map(
      (key) => {
        return new CognitoUserAttribute({
          Name: convertToCognitoKey(key),
          Value: profileForm[key] || "",
        });
      }
    );
    user.updateAttributes(attributes, (err) => {
      if (err) {
        console.error(err.message || JSON.stringify(err));
        toast.error("プロフィールの更新に失敗しました。");
        return;
      }
      toast.success("プロフィールの更新に成功しました。");
      navigate("/settings/profile", {
        state: {
          shouldLoadCurrentUser: true,
        },
      });
    });
  }, [navigate, profileForm, user]);

  const handleChangeForm = useCallback<
    React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
  >((event) => {
    const field = event.target.name as keyof profileForm;
    setProfileForm((prev) => {
      return {
        ...prev,
        [field]: event.target.value,
      };
    });
  }, []);

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
              value={profileForm.email}
              onChange={handleChangeForm}
            />
            <Input
              name="website"
              id="website"
              label="Website"
              type="text"
              placeholder="プロフィールがわかるウェブサイトを入力"
              value={profileForm.website}
              onChange={handleChangeForm}
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
                value={profileForm.description}
                onChange={handleChangeForm}
              />
            </Grid>
            <Grid item container justifyContent="center" spacing={3}>
              <Grid item>
                <Button
                  variant="outlined"
                  style={{ fontSize: "1.4rem" }}
                  onClick={handleSubmitForm}
                >
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
