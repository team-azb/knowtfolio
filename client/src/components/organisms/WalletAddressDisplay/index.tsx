import JetBrainsMono from "~/components/atoms/JetBrainsMono";
import TrancatedText from "~/components/atoms/TruncatedText";

type walletAddressDisplayProps = {
  address?: string;
  shouldTruncate?: boolean;
  style?: React.CSSProperties;
};

/**
 * wallet addressを表示するためのコンポーネント
 * @address 表示するaddress
 * @shouldTruncate addressを短縮して表示するかどうか
 * @style 適用するstyle
 */
const WalletAddressDisplay = ({
  address,
  style,
  shouldTruncate = true,
}: walletAddressDisplayProps) => {
  return (
    <>
      {address ? (
        <JetBrainsMono style={style}>
          {shouldTruncate ? (
            <TrancatedText text={address} m={8} n={4} />
          ) : (
            address
          )}
        </JetBrainsMono>
      ) : (
        "未登録"
      )}
    </>
  );
};

export default WalletAddressDisplay;
