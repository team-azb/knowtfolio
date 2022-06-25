import React from "react";
import AuthProvider, { useOptionalAuth } from "../../contexts/AuthContext";

type props = {
  children: React.ReactNode;
};

const Switcher = ({ children }: props) => {
  const auth = useOptionalAuth();
  return <>{auth ? children : <div>サインインが必要です</div>}</>;
};

const AuthRequired = ({ children }: props) => {
  return (
    <AuthProvider>
      <Switcher>{children}</Switcher>
    </AuthProvider>
  );
};

export default AuthRequired;
