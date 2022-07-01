import { useOptionalAuth } from "~/components/organisms/OptionalAuthProvider";

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
