import { useOptionalAuth } from "~/components/contexts/AuthContext";

const Header = () => {
  const auth = useOptionalAuth();
  return (
    <div>
      <h1>knowtfolio</h1>
      <p>{auth && auth.user.getUsername()}</p>
    </div>
  );
};

export default Header;
