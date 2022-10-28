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
  address: string;
  isTrancated?: boolean;
  style?: React.CSSProperties;
};

const WalletAddressDisplay = ({
  address,
  style,
  isTrancated = true,
}: walletAddressDisplayProps) => {
  return (
    <JetBrainsMono style={style}>
      {isTrancated ? truncate(address, 8, 4) : address}
    </JetBrainsMono>
  );
};

export default WalletAddressDisplay;
