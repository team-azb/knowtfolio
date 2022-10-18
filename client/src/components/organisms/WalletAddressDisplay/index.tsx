import { truncate } from "~/helpers/utils";

type walletAddressDisplayProps = {
  address: string;
};

const WalletAddressDisplay = ({ address }: walletAddressDisplayProps) => {
  return <strong>{truncate(address, 8, 4)}</strong>;
};

export default WalletAddressDisplay;
