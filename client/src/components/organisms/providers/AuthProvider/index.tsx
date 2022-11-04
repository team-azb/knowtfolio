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
  contentWhileLoadingSession?: React.ReactNode;
};

/**
 * 認証が必要なコンポーネントで認証されていない場合に表示するデフォルトのUI
 */
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

/**
 * 認証情報を確認している際に表示するデフォルトのUI
 */
const defualtContentWhileLoadingSession = (
  <div style={{ padding: "100px 400px" }}>
    <LoadingDisplay message="認証情報をローディング中" />
  </div>
);

const AuthProvider = ({
  children,
  contentOnUnauthenticated = defaultContentOnUnauthenticated,
  contentWhileLoadingSession = defualtContentWhileLoadingSession,
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
    }
    setHasLoadedSession(true);
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
      return contentWhileLoadingSession;
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
    contentWhileLoadingSession,
    contentOnUnauthenticated,
    hasLoadedSession,
  ]);

  return <>{content}</>;
};

export default AuthProvider;
export const useAuthContext = () => {
  return useContext(authContext);
};
