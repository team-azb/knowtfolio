import { useCallback, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { signOutCognito } from "./helper";

const Mypage = () => {
  const { user, attributes } = useAuth();
  const email = useMemo(() => {
    return attributes.find((atr) => atr.Name === "email")?.Value;
  }, [attributes]);

  const signOut = useCallback(async () => {
    await signOutCognito(user);
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
