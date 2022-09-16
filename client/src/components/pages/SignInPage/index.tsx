import { useCallback, useMemo, useState } from "react";
import PasswordSignInForm from "~/components/organisms/forms/PasswordSignInForm";
import WalletSignInForm from "~/components/organisms/forms/WalletSignInForm";

type signinMethod = "password" | "wallet";

const SignInPage = () => {
  const [signinMethod, setSigninMethod] = useState<signinMethod>("password");

  const changeSigninMethod = useCallback<
    React.ChangeEventHandler<HTMLSelectElement>
  >((event) => {
    setSigninMethod(event.target.value as signinMethod);
  }, []);

  const signinForm = useMemo(() => {
    return signinMethod === "password" ? (
      <PasswordSignInForm />
    ) : (
      <WalletSignInForm />
    );
  }, [signinMethod]);

  return (
    <div>
      <select value={signinMethod} onChange={changeSigninMethod}>
        <option value="password">パスワードでログイン</option>
        <option value="wallet">ウォレットでログイン</option>
      </select>
      {signinForm}
    </div>
  );
};

export default SignInPage;
