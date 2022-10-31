import {
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserSession,
} from "amazon-cognito-identity-js";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { userPool } from "~/configs/cognito";
import { loadAttributes, loadSession } from "~/apis/cognito";
import { Link } from "react-router-dom";
import LoadingDisplay from "~/components/atoms/LoadingDisplay";

export type AuthContext = {
  user: CognitoUser;
  session: CognitoUserSession;
  attributes: CognitoUserAttribute[];
};

const authContext = createContext<AuthContext>({} as AuthContext);

type props = {
  children: React.ReactNode;
  contentOnUnauthenticated?: React.ReactNode;
  contentOnLoadingSesstion?: React.ReactNode;
};

const defaultContentOnUnauthenticated = (
  <div style={{ padding: "100px 400px" }}>
    <h2>サインインが必要です</h2>
    <p>
      <Link to="/signin">こちら</Link>からサインインできます
    </p>
    <p>
      アカウントをお持ちでない方は<Link to="/signup">こちら</Link>
      からサインアップできます
    </p>
  </div>
);

const AuthProvider = ({
  children,
  contentOnUnauthenticated = defaultContentOnUnauthenticated,
  contentOnLoadingSesstion = <LoadingDisplay message="ローディング中" />,
}: props) => {
  const [auth, setAuth] = useState<AuthContext | null>(null);
  const [hasLoadedSession, setHasLoadedSession] = useState(false);

  const setCurrentUser = useCallback(async () => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      const session = await loadSession(cognitoUser);
      const attributes = await loadAttributes(cognitoUser);
      setAuth({
        user: cognitoUser,
        session: session,
        attributes: attributes,
      });
      setHasLoadedSession(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("storage", setCurrentUser);
    setCurrentUser();
    return () => {
      window.removeEventListener("storage", setCurrentUser);
    };
  }, [setCurrentUser]);

  const content = useMemo(() => {
    if (!hasLoadedSession) {
      return contentOnLoadingSesstion;
    } else if (auth) {
      return (
        <authContext.Provider value={auth}>{children}</authContext.Provider>
      );
    } else {
      return contentOnUnauthenticated;
    }
  }, [
    auth,
    children,
    contentOnLoadingSesstion,
    contentOnUnauthenticated,
    hasLoadedSession,
  ]);

  return <>{content}</>;
};

export default AuthProvider;
export const useAuthContext = () => {
  return useContext(authContext);
};
