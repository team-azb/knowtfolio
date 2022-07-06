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

export type AuthContext = {
  user: CognitoUser;
  session: CognitoUserSession;
  attributes: CognitoUserAttribute[];
};

const authContext = createContext<AuthContext>({} as AuthContext);

type props = {
  children: React.ReactNode;
  contentForUnauthorized?: React.ReactNode;
};

const AuthProvider = (props: props) => {
  const [auth, setAuth] = useState<AuthContext | null>(null);

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

  const content = useMemo(() => {
    if (auth) {
      return (
        <authContext.Provider value={auth}>
          {props.children}
        </authContext.Provider>
      );
    } else if (props.contentForUnauthorized) {
      return props.contentForUnauthorized;
    } else {
      return <div>サインインが必要です</div>;
    }
  }, [auth, props.children, props.contentForUnauthorized]);

  return <>{content}</>;
};

export default AuthProvider;
export const useAuthContext = () => {
  return useContext(authContext);
};
