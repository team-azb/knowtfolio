import { useCallback, useMemo, useState } from "react";
import {
  createPutImageObjectCommand,
  getS3ClientWithCognitoJwtToken,
} from "~/apis/s3";
import { useAuth } from "~/components/contexts/AuthContext";

type imageForm = {
  blob: Blob;
  url: string;
  name: string;
};

const ImageUpload = () => {
  const [imageForm, setImageForm] = useState<imageForm | null>(null);
  const { session } = useAuth();
  const s3Client = useMemo(() => {
    return getS3ClientWithCognitoJwtToken(
      session.getAccessToken().getJwtToken()
    );
  }, [session]);

  const uploadImage = useCallback(async () => {
    if (imageForm) {
      try {
        const command = createPutImageObjectCommand(
          `images/${imageForm.name}`,
          imageForm.blob
        );
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

export default ImageUpload;
