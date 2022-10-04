import { CognitoUserAttribute } from "amazon-cognito-identity-js";
import { useCallback, useMemo, useState } from "react";
import { useAuthContext } from "~/components/organisms/providers/AuthProvider";
import { useWeb3Context } from "~/components/organisms/providers/Web3Provider";

const ResetWalletPage = () => {
  const [walletAddressInput, setWalletAddressInput] = useState<string | null>(
    null
  );
  const { user, attributes } = useAuthContext();
  const walletAddress = useMemo(() => {
    const walletAddress = attributes.find(
      (atr) => atr.Name === "custom:wallet_address"
    )?.Value;
    return walletAddress;
  }, [attributes]);
  const { account } = useWeb3Context();

  const resetWalletAddress = useCallback(() => {
    if (walletAddressInput) {
      user.updateAttributes(
        [
          new CognitoUserAttribute({
            Name: "custom:wallet_address",
            Value: walletAddressInput,
          }),
        ],
        (err) => {
          if (err) {
            alert(err.message || JSON.stringify(err));
            return;
          }
          alert("wallet addressの更新に成功しました");
          window.location.reload();
        }
      );
    }
  }, [user, walletAddressInput]);

  const onChangeWalletAddressInput = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >(
    (event) => {
      if (event.target.id === "wallet_address") {
        setWalletAddressInput(account);
      } else {
        setWalletAddressInput(null);
      }
    },
    [account]
  );

  return (
    <div>
      <h2>wallet addressを再設定する</h2>
      <p>現在のwallet address: {walletAddress || "未登録"}</p>
      <div>
        新しいwallet address:
        <div>
          <input
            type="radio"
            name="wallet"
            id="wallet_address"
            checked={walletAddressInput !== null}
            onChange={onChangeWalletAddressInput}
          />
          <label htmlFor="wallet_address">
            <b>{account}</b>を登録する
          </label>
        </div>
        <div>
          <input
            type="radio"
            name="wallet"
            id="none"
            checked={walletAddressInput === null}
            onChange={onChangeWalletAddressInput}
          />
          <label htmlFor="none">wallet addressを登録解除する</label>
        </div>
      </div>
      <button onClick={resetWalletAddress}>update</button>
    </div>
  );
};

export default ResetWalletPage;
