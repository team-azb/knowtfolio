import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useMemo } from "react";

type iconImageProps = {
  size?: number;
  url?: string;
};

const IconImage = ({ size = 150, url }: iconImageProps) => {
  const [imgSize, imgPadding] = useMemo(() => {
    return [(size * 5) / 6, size / 12];
  }, [size]);
  return (
    <>
      {url ? (
        <img
          src={url}
          alt="preview image"
          style={{
            borderRadius: "50%",
            width: imgSize,
            height: imgSize,
            padding: imgPadding,
          }}
        />
      ) : (
        <AccountCircleIcon sx={{ fontSize: size }} />
      )}
    </>
  );
};

export default IconImage;
