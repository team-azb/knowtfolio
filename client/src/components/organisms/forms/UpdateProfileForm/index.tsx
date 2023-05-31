import { Button, Grid } from "@mui/material";
import Form from "~/components/atoms/authForm/Form";
import Spacer from "~/components/atoms/Spacer";
import Input from "~/components/atoms/authForm/Input";
import Label from "~/components/atoms/authForm/Label";
import TextareaAutosize from "@mui/base/TextareaAutosize";
import { grey } from "@mui/material/colors";
import { useAuthContext } from "~/components/organisms/providers/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { CognitoUserAttribute } from "amazon-cognito-identity-js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { ARTICLE_RESOURCES_S3_BUCKET } from "~/configs/s3";
import { useS3Client } from "~/apis/s3";
import IconImage from "~/components/atoms/IconImage";
import imageCompression from "browser-image-compression";
import validator from "validator";

type profileForm = {
  website?: string;
  description?: string;
  picture?: string;
};

type imageForm = {
  blob: Blob;
  url: string;
  name: string;
};

/**
 * profileFormをCognitoのattributeの配列に変換する
 * @param form profileForm
 * @returns attributeの配列
 */
const convertToAttributes = (form: profileForm) => {
  return (Object.keys(form) as (keyof profileForm)[]).map((key) => {
    const cognitoKey = key === "description" ? "custom:description" : key;
    return new CognitoUserAttribute({
      Name: cognitoKey,
      Value: form[key] || "",
    });
  });
};

const descriptionMaxLength = 160;

/**
 * プロフィールを編集するフォーム
 */
const UpdateProfileForm = () => {
  const {
    user,
    attributes: { email, website, description, picture },
  } = useAuthContext();
  const [profileForm, setProfileForm] = useState<profileForm>({
    website,
    description,
  });
  const descriptionLength = useMemo(() => {
    return profileForm.description?.length || 0;
  }, [profileForm.description?.length]);
  const navigate = useNavigate();
  const [imageForm, setImageForm] = useState<imageForm | null>(null);
  const s3Client = useS3Client();
  const { isValidForm, isValidBio, isValidURL } = useMemo(() => {
    const isValidBio = descriptionLength <= descriptionMaxLength;
    const isValidURL = profileForm.website
      ? validator.isURL(profileForm.website, {
          require_protocol: true,
          protocols: ["http", "https"],
        })
      : true;
    return { isValidForm: isValidBio && isValidURL, isValidBio, isValidURL };
  }, [descriptionLength, profileForm.website]);

  const handleSubmitForm = useCallback(async () => {
    let form = { ...profileForm };
    if (imageForm) {
      const command = new PutObjectCommand({
        Bucket: ARTICLE_RESOURCES_S3_BUCKET,
        Key: `images/${imageForm.name}`,
        Body: imageForm.blob,
      });
      try {
        await s3Client.send(command);
        const uri = encodeURI(
          `https://knowtfolio.com/images/${imageForm.name}`
        );
        form = { ...form, picture: uri };
        toast.success("プロフィール画像の更新に成功しました。");
      } catch (error) {
        console.error(error);
        toast.error("プロフィール画像の更新に失敗しました。");
      }
    }

    const attributes = convertToAttributes(form);

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
  }, [imageForm, navigate, profileForm, s3Client, user]);

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

  const handleSetImage = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >(async (event) => {
    try {
      const files = event.target.files;
      if (files?.length) {
        const fr = new FileReader();
        const compressedFile = await imageCompression(files[0], {
          maxSizeMB: 0.009765625, // 10kb
          useWebWorker: true,
          maxIteration: 100,
        });
        fr.readAsDataURL(compressedFile);
        fr.addEventListener("load", () => {
          setImageForm({
            blob: compressedFile,
            url: String(fr.result),
            name: compressedFile.name,
          });
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("画像の読み込みに失敗しました。");
    }
  }, []);

  const websiteMessage = useMemo(() => {
    if (!profileForm.website) {
      return undefined;
    } else if (isValidURL) {
      return <p style={{ color: "green" }}>有効なURLです。</p>;
    } else {
      return <p style={{ color: "red" }}>無効なURLです。</p>;
    }
  }, [isValidURL, profileForm.website]);

  return (
    <Form>
      <h2>プロフィールを編集</h2>
      <hr />
      <Spacer height="3rem" />
      <Grid container direction="row" spacing={5}>
        <Grid item>
          <Button
            variant="text"
            component="label"
            style={{ fontSize: 14, padding: 0 }}
          >
            <IconImage url={imageForm?.url || picture} size={180} />
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleSetImage}
            />
          </Button>
        </Grid>
        <Grid item flexGrow={1}>
          <Grid container direction="column" spacing={2}>
            <Grid item container direction="column">
              <Label>Username</Label>
              <Grid item>{user.getUsername()}</Grid>
            </Grid>
            <Grid item container direction="column">
              <Label>Email</Label>
              <Grid item>{email}</Grid>
            </Grid>
            <Input
              name="website"
              id="website"
              label="Website"
              type="text"
              placeholder="プロフィールがわかるウェブサイトを入力"
              value={profileForm.website}
              onChange={handleChangeForm}
              message={websiteMessage}
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
              <Grid item container>
                <p style={{ color: "red" }}>
                  {!isValidBio &&
                    `自己紹介の文字数は${descriptionMaxLength}文字以内にしてください`}
                </p>
                <Grid
                  item
                  flexGrow={1}
                  style={{
                    color: isValidBio ? "green" : "red",
                  }}
                >
                  <Grid container direction="row-reverse">
                    {descriptionLength}/160文字
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item container justifyContent="center" spacing={3}>
              <Grid item>
                <Button
                  variant="outlined"
                  style={{ fontSize: "1.4rem" }}
                  disabled={!isValidForm}
                  onClick={handleSubmitForm}
                >
                  update
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  style={{ fontSize: "1.4rem" }}
                  onClick={() => navigate(`/users/${user.getUsername()}`)}
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

export default UpdateProfileForm;
