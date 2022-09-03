import { useCallback, useState } from "react";
import { signInToCognitoWithWallet } from "~/apis/cognito";
import { useWeb3Context } from "~/components/organisms/providers/Web3Provider";

type signInWithPasswordForm = {
  username: string;
  password: string;
};

const SignInPage = () => {
  const { web3, account } = useWeb3Context();
  const [form, setForm] = useState<signInWithPasswordForm>({
    username: "",
    password: "",
  });

  const changeForm = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      switch (event.target.name) {
        case "username":
        case "password":
          setForm((prev) => {
            return { ...prev, [event.target.name]: event.target.value };
          });
          break;
        default:
          break;
      }
    },
    []
  );

  const signIn = useCallback(async () => {
    try {
      await signInToCognitoWithWallet(form.username, web3, account);
      alert("サインイン成功");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("サインイン失敗");
    }
  }, [form]);
  return (
    <div>
      <div>
        username
        <input
          name="username"
          onChange={changeForm}
          value={form.username}
          type="text"
        />
      </div>
      <div>
        password
        <input
          name="password"
          onChange={changeForm}
          value={form.password}
          type="password"
        />
      </div>
      <div>
        <button onClick={signIn}>sign in</button>
      </div>
    </div>
  );
};

export default SignInPage;
