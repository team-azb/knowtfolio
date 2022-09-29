import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PasswordSignInForm from "~/components/organisms/forms/PasswordSignInForm";
import WalletSignInForm from "~/components/organisms/forms/WalletSignInForm";
import { useQuery } from "~/helpers/reactRouter";

const SignInPage = () => {
  const query = useQuery();
  const signInMethod = useMemo(() => {
    return query.get("method") || "password";
  }, [query]);
  const navigate = useNavigate();

  const onChangeSigninMethodSelect = useCallback<
    React.ChangeEventHandler<HTMLSelectElement>
  >(
    (event) => {
      navigate(`/signin?method=${event.target.value}`);
    },
    [navigate]
  );

  const signinForm = useMemo(() => {
    switch (signInMethod) {
      case "password":
        return <PasswordSignInForm />;
      case "wallet":
        return <WalletSignInForm />;
      default:
        return <PasswordSignInForm />;
    }
  }, [signInMethod]);

  return (
    <div>
      <select value={signInMethod} onChange={onChangeSigninMethodSelect}>
        <option value="password">パスワードでログイン</option>
        <option value="wallet">ウォレットでログイン</option>
      </select>
      {signinForm}
    </div>
  );
};

export default SignInPage;
