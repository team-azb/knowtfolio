import React, { createContext, useContext } from "react";
import OptionalAuthProvider, {
  AuthContext,
  useOptionalAuth,
} from "~/components/organisms/providers/OptionalAuthProvider";

type switcherProps = {
  children: React.ReactNode;
};

const authContext = createContext<AuthContext>({} as AuthContext);

const Switcher = ({ children }: switcherProps) => {
  const auth = useOptionalAuth();
  return (
    <>
      {auth ? (
        <authContext.Provider value={auth}>{children}</authContext.Provider>
      ) : (
        <div>サインインが必要です</div>
      )}
    </>
  );
};

type props = {
  element: JSX.Element;
};

const AuthProvider = ({ element }: props) => {
  return (
    <OptionalAuthProvider>
      <Switcher>{element}</Switcher>
    </OptionalAuthProvider>
  );
};

export default AuthProvider;
export const useAuth = () => {
  return useContext(authContext);
};
