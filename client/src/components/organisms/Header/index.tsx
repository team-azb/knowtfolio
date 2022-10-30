import { useNavigate } from "react-router-dom";
import { Grid, Button } from "@mui/material";
import AuthProvider, {
  useAuthContext,
} from "~/components/organisms/providers/AuthProvider";
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
      style={{ fontSize: "1.4rem" }}
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
          style={{ fontSize: "1.4rem" }}
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
          style={{ fontSize: "1.4rem" }}
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
        <p
          style={{
            padding: "1rem",
            fontSize: "4.5rem",
            fontWeight: 600,
            cursor: "pointer",
            letterSpacing: "0.1rem",
          }}
          onClick={() => {
            navigate("/");
          }}
        >
          Knowtfolio
        </p>
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
                style={{ fontSize: "1.4rem" }}
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
