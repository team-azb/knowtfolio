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

export type AuthContext = {
  user: CognitoUser;
  session: CognitoUserSession;
  attributes: CognitoUserAttribute[];
};

const optionalAuthContext = createContext<AuthContext | null>(null);

type props = {
  children: React.ReactNode;
};

const OptionalAuthProvider = ({ children }: props) => {
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

  return (
    <optionalAuthContext.Provider value={auth}>
      {children}
    </optionalAuthContext.Provider>
  );
};

export default OptionalAuthProvider;
export const useOptionalAuth = () => {
  return useContext(optionalAuthContext);
};
