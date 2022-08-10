import { useCallback, useMemo } from "react";
import { useAuthContext } from "~/components/organisms/providers/AuthProvider";
import { signOutFromCognito } from "~/apis/cognito";

const AccountPage = () => {
  const { user, attributes } = useAuthContext();
  const email = useMemo(() => {
    return attributes.find((atr) => atr.Name === "email")?.Value;
  }, [attributes]);

  const signOut = useCallback(async () => {
    await signOutFromCognito(user);
    window.location.reload();
  }, [user]);

  return (
    <div>
      <p>username: {user.getUsername()}</p>
      <p>email: {email}</p>
      <button onClick={signOut}>sign out</button>
    </div>
  );
};

export default AccountPage;
