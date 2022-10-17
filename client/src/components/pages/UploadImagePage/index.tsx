import { PutObjectCommand } from "@aws-sdk/client-s3";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { useCallback, useMemo, useState } from "react";
import { useAuthContext } from "~/components/organisms/providers/AuthProvider";
import { COGNITO_USER_POOL_ID } from "~/configs/cognito";
import {
  COGNITO_IDENTITY_POOL_ID,
  getS3Client,
  ARTICLE_RESOURCES_S3_BUCKET,
} from "~/configs/s3";

type imageForm = {
  blob: Blob;
  url: string;
  name: string;
};

const UploadImagePage = () => {
  const [imageForm, setImageForm] = useState<imageForm | null>(null);
  const { session } = useAuthContext();
  const s3Client = useMemo(() => {
    return getS3Client(
      fromCognitoIdentityPool({
        identityPoolId: COGNITO_IDENTITY_POOL_ID,
        logins: {
          [`cognito-idp.ap-northeast-1.amazonaws.com/${COGNITO_USER_POOL_ID}`]:
            session.getIdToken().getJwtToken(),
        },
        clientConfig: {
          region: "ap-northeast-1",
        },
      })
    );
  }, [session]);

  const uploadImage = useCallback(async () => {
    if (imageForm) {
      const command = new PutObjectCommand({
        Bucket: ARTICLE_RESOURCES_S3_BUCKET,
        Key: `images/${imageForm.name}`,
        Body: imageForm.blob,
      });
      try {
        await s3Client.send(command);
        alert("successfully uploaded file");
      } catch (error) {
        console.error(error);
        alert("uploading file failed...");
      }
    } else {
      alert("please input your image before");
    }
  }, [imageForm, s3Client]);

  const setImageOnForm = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((event) => {
    const files = event.target.files;
    if (files?.length) {
      const fr = new FileReader();
      fr.readAsDataURL(files[0]);
      fr.addEventListener("load", () => {
        setImageForm({
          blob: files[0],
          url: String(fr.result),
          name: files[0].name,
        });
      });
    }
  }, []);

  return (
    <div>
      <div>
        input image
        <input onChange={setImageOnForm} accept="image/*" type="file" />
      </div>
      {imageForm && (
        <div>
          preview
          <div>
            <img src={imageForm?.url} alt="preview image" />
          </div>
        </div>
      )}

      <div>
        <button onClick={uploadImage}>upload</button>
      </div>
    </div>
  );
};

export default UploadImagePage;
