import { useCallback, useMemo } from "react";
import { useAuthContext } from "~/components/organisms/providers/AuthProvider";
import { signOutFromCognito } from "~/apis/cognito";
import { Link } from "react-router-dom";

const AccountPage = () => {
  const { user, attributes } = useAuthContext();
  const [email, walletAddress] = useMemo(() => {
    const email = attributes.find((atr) => atr.Name === "email")?.Value;
    const walletAddress = attributes.find(
      (atr) => atr.Name === "custom:wallet_address"
    )?.Value;
    return [email, walletAddress];
  }, [attributes]);

  const signOut = useCallback(async () => {
    await signOutFromCognito(user);
    window.location.reload();
  }, [user]);

  return (
    <div>
      <p>username: {user.getUsername()}</p>
      <p>email: {email}</p>
      <p>
        wallet address: {walletAddress || "未登録"}{" "}
        <Link to="/reset-wallet">変更/登録する</Link>{" "}
      </p>
      <button onClick={signOut}>sign out</button>
    </div>
  );
};

export default AccountPage;
