import AuthProvider, {
  useAuthContext,
} from "~/components/organisms/providers/AuthProvider";

const AcountInfo = () => {
  const { user } = useAuthContext();
  return <p>{user.getUsername()}</p>;
};

const Header = () => {
  return (
    <div>
      <h1>knowtfolio</h1>
      <AuthProvider contentForUnauthorized={<p>未認証ユーザー</p>}>
        <AcountInfo />
      </AuthProvider>
    </div>
  );
};

export default Header;
