import { useNavigate } from "react-router-dom";
import AuthProvider, {
  useAuthContext,
} from "~/components/organisms/providers/AuthProvider";

const AcountInfo = () => {
  const { user } = useAuthContext();
  return <p>{user.getUsername()}</p>;
};

const Header = () => {
  const navigate = useNavigate();
  return (
    <div>
      <h1
        style={{ cursor: "pointer" }}
        onClick={() => {
          navigate("/");
        }}
      >
        knowtfolio
      </h1>
      <AuthProvider contentOnUnauthenticated={<p>未認証ユーザー</p>}>
        <AcountInfo />
      </AuthProvider>
    </div>
  );
};

export default Header;
