import JetBrainsMono from "~/components/atoms/JetBrainsMono";

/**
 * trancate long string
 * @param str original string
 * @param m Display the first m characters
 * @param n Display the last n characters
 * @returns truncated string
 */
export const truncate = (str: string, m: number, n: number) => {
  return str.length > m + n
    ? str.slice(0, m - 1) + "..." + str.slice(-(n + 1), -1)
    : str;
};

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
          {shouldTruncate ? truncate(address, 8, 4) : address}
        </JetBrainsMono>
      ) : (
        "未登録"
      )}
    </>
  );
};

export default WalletAddressDisplay;
