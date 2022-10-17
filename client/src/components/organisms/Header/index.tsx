import { useNavigate } from "react-router-dom";
import { Grid, Button } from "@mui/material";
import AuthProvider, {
  useAuthContext,
} from "~/components/organisms/providers/AuthProvider";
import logo from "~/components/organisms/Header/logo.png";
import { grey } from "@mui/material/colors";

const AcountInfo = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  return (
    <Button
      onClick={() => {
        navigate("/mypage");
      }}
      variant="outlined"
    >
      {user.getUsername()}
    </Button>
  );
};

const AuthButtons = () => {
  const navigate = useNavigate();

  return (
    <>
      <Grid xs={2}>
        <Button
          onClick={() => {
            navigate("/signup");
          }}
          variant="outlined"
        >
          sign up
        </Button>{" "}
      </Grid>
      <Grid xs={2}>
        <Button
          onClick={() => {
            navigate("/signin");
          }}
          variant="outlined"
        >
          sign in
        </Button>
      </Grid>
    </>
  );
};

const Header = () => {
  const navigate = useNavigate();
  return (
    <Grid
      container
      alignItems="center"
      style={{
        padding: 8,
        borderBottom: "solid",
        borderWidth: 1,
        borderColor: grey[500],
      }}
    >
      <Grid xs={6}>
        <img
          style={{ cursor: "pointer", width: 250 }}
          onClick={() => {
            navigate("/");
          }}
          src={logo}
        />
      </Grid>
      <Grid xs={6}>
        <Grid container direction="row-reverse" alignItems="center">
          <AuthProvider contentOnUnauthenticated={<AuthButtons />}>
            <Grid xs={2}>
              <AcountInfo />
            </Grid>
            <Grid xs={2}>
              <Button
                onClick={() => {
                  navigate("/articles/new");
                }}
              >
                create article
              </Button>
            </Grid>
          </AuthProvider>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Header;
