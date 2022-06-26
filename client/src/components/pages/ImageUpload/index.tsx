import { PutObjectCommand } from "@aws-sdk/client-s3";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { useCallback, useMemo } from "react";
import { useAuth } from "~/components/contexts/AuthContext";
import { COGNITO_USER_POOL_ID } from "~/configs/cognito";
import { COGNITO_IDENTITY_ID, getS3Client } from "~/configs/s3";

const ImageUpload = () => {
  const { session } = useAuth();
  const s3Client = useMemo(() => {
    return getS3Client(
      fromCognitoIdentityPool({
        identityPoolId: COGNITO_IDENTITY_ID,
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

  const uploadFile = useCallback(async () => {
    const command = new PutObjectCommand({
      Bucket: "knowtfolio-alpha",
      Key: "sample.txt",
      Body: "sample",
    });
    try {
        await s3Client.send(command);
        alert("successfully uploaded file")
    } catch (error) {
        console.error(error)
        alert("uploading file failed...")
    }
  }, [s3Client]);

  return (
    <div>
      <div>
        input image
        <input type="file" />
      </div>
      <div>
        <button onClick={uploadFile}>upload</button>
      </div>
    </div>
  );
};

export default ImageUpload;
