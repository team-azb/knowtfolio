import { ReactNode } from "react";
import ConnectToMetamaskButton from "~/components/organisms/ConnectToMetamaskButton";

type requireWeb3Wrapper = {
  isConnectedMetamask: boolean;
  contentOnNotConnected?: ReactNode;
  children: ReactNode;
};

/**
 * Metamaskへの接続を必要とする
 * Metamaskに接続していない場合は
 * @isConnectedMetamask Metamaskに接続しているかのフラグ
 * @contentOnNotConnected Metamaskに接続していない場合の表示
 */
const RequireWeb3Wrapper = ({
  children,
  isConnectedMetamask,
  contentOnNotConnected = <ConnectToMetamaskButton />,
}: requireWeb3Wrapper) => {
  return <>{isConnectedMetamask ? children : contentOnNotConnected}</>;
};

export default RequireWeb3Wrapper;
