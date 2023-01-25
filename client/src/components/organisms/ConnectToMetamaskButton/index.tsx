import MetamaskButton from "~/components/atoms/MetamaskButton";
import { useWeb3Context } from "~/components/organisms/providers/Web3Provider";

/**
 * Metamaskに接続するためのボタン
 * Metamaskがインストールされていなかったら、ダウンロードページへの遷移を表示
 */
const ConnectToMetamaskButton = () => {
  const { connectMetamask } = useWeb3Context();

  return (
    <>
      {connectMetamask ? (
        <MetamaskButton
          onClick={connectMetamask}
          variant="contained"
          style={{ fontSize: "1.4rem" }}
        >
          metamaskに接続
        </MetamaskButton>
      ) : (
        <MetamaskButton
          variant="contained"
          style={{ fontSize: "1.4rem" }}
          onClick={() => {
            window.open("https://metamask.io/download/");
          }}
        >
          metamaskをインストール
        </MetamaskButton>
      )}
    </>
  );
};

export default ConnectToMetamaskButton;
