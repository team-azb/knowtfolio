import { ReactNode } from "react";
import ConnectToMetamaskButton from "~/components/organisms/ConnectToMetamaskButton";

type requireWeb3Wrapper = {
  isConnectedToMetamask: boolean;
  contentOnNotConnected?: ReactNode;
  children: ReactNode;
};

/**
 * Metamaskへの接続を必要とする
 * Metamaskに接続していない場合は
 * @isConnectedToMetamask Metamaskに接続しているかのフラグ
 * @contentOnNotConnected Metamaskに接続していない場合の表示
 */
const RequireWeb3Wrapper = ({
  children,
  isConnectedToMetamask,
  contentOnNotConnected = <ConnectToMetamaskButton />,
}: requireWeb3Wrapper) => {
  return <>{isConnectedToMetamask ? children : contentOnNotConnected}</>;
};

export default RequireWeb3Wrapper;
