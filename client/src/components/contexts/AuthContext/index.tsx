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
  useState,
} from "react";
import { userPool } from "~/configs/cognito";
import { loadAttributes, loadSession } from "~/apis/cognito";

type authContext = {
  user: CognitoUser;
  session: CognitoUserSession;
  attributes: CognitoUserAttribute[];
};

const AuthContext = createContext<authContext | null>(null);

type props = {
  children: React.ReactNode;
};

const AuthProvider = ({ children }: props) => {
  const [auth, setAuth] = useState<authContext | null>(null);

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
  }, []);

  useEffect(() => {
    window.addEventListener("storage", setCurrentUser);
    setCurrentUser();
    return () => {
      window.removeEventListener("storage", setCurrentUser);
    };
  }, [setCurrentUser]);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
export const useOptionalAuth = () => {
  return useContext(AuthContext);
};
export const useAuth = () => {
  const auth = useContext(AuthContext);
  if (auth) {
    return auth;
  } else {
    throw new Error("認証に失敗しています。");
  }
};
