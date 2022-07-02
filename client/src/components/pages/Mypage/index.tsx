import { useCallback, useMemo } from "react";
import { useAuth } from "~/components/organisms/AuthProvider";
import { signOutFromCognito } from "~/apis/cognito";

const Mypage = () => {
  const { user, attributes } = useAuth();
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

export default Mypage;