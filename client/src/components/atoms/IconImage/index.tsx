import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useMemo } from "react";

type iconImageProps = {
  size?: number;
  url?: string;
};

/**
 * 丸い画像(Icon)の表示
 * ※urlが無い場合、デフォルトのIconを表示
 * @size 画像のサイズ(px)
 * @url 画像のurl
 */
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
