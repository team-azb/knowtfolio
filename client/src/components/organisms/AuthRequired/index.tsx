import React from "react";
import AuthProvider, {
  useOptionalAuth,
} from "~/components/contexts/AuthContext";

type switcherProps = {
  children: React.ReactNode;
};

const Switcher = ({ children }: switcherProps) => {
  const auth = useOptionalAuth();
  return <>{auth ? children : <div>サインインが必要です</div>}</>;
};

type props = {
  element: JSX.Element;
};

const AuthRequiredRoute = ({ element }: props) => {
  return (
    <AuthProvider>
      <Switcher>{element}</Switcher>
    </AuthProvider>
  );
};

export default AuthRequiredRoute;
