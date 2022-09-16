import { CognitoUserAttribute } from "amazon-cognito-identity-js";
import { useCallback, useMemo, useState } from "react";
import { useAuthContext } from "~/components/organisms/providers/AuthProvider";

const ResetWalletPage = () => {
  const [walletAddressInput, setWalletAddressInput] = useState("");
  const { user, attributes } = useAuthContext();
  const walletAddress = useMemo(() => {
    const walletAddress = attributes.find(
      (atr) => atr.Name === "custom:wallet_address"
    )?.Value;
    return walletAddress;
  }, [attributes]);

  const changeWalletAddressInput = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((event) => {
    setWalletAddressInput(event.target.value);
  }, []);

  const resetWalletAddress = useCallback(() => {
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
  }, [user, walletAddressInput]);
  return (
    <div>
      <h2>wallet addressを再設定する</h2>
      <p>現在のwallet address: {walletAddress || "未登録"}</p>
      <div>
        新しいwallet address:{" "}
        <input
          type="text"
          placeholder="new wallet address"
          onChange={changeWalletAddressInput}
        />
      </div>
      <button onClick={resetWalletAddress}>update</button>
    </div>
  );
};

export default ResetWalletPage;
