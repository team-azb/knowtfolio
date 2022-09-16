import { useCallback, useState } from "react";
import { signInToCognitoWithWallet } from "~/apis/cognito";
import { useWeb3Context } from "../../providers/Web3Provider";

const WalletSignInForm = () => {
  const [username, setUsername] = useState("");
  const { web3, account } = useWeb3Context();

  const changeUsername = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((event) => {
    setUsername(event.target.value);
  }, []);

  const signIn = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    async (event) => {
      event.preventDefault();
      try {
        await signInToCognitoWithWallet(username, web3, account);
        alert("サインイン成功");
        window.location.reload();
      } catch (error) {
        console.error(error);
        alert("サインイン失敗");
      }
    },
    [account, username, web3]
  );

  return (
    <form>
      連携されているwallet address: {account}
      <div>
        username
        <input
          name="username"
          type="text"
          placeholder="username"
          onChange={changeUsername}
          value={username}
        />
      </div>
      <button onClick={signIn}>sign in</button>
    </form>
  );
};

export default WalletSignInForm;
