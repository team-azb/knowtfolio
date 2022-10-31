import { useNavigate } from "react-router-dom";
import { Grid, Button } from "@mui/material";
import AuthProvider, {
  useAuthContext,
} from "~/components/organisms/providers/AuthProvider";
import { grey } from "@mui/material/colors";
import LoadingDisplay from "~/components/atoms/LoadingDisplay";
import WalletAddressDisplay from "~/components/organisms/WalletAddressDisplay";
import { useMemo } from "react";

const AcountInfo = () => {
  const { user, attributes } = useAuthContext();
  const navigate = useNavigate();
  const walletAddress = useMemo(() => {
    const walletAddress = attributes.find(
      (atr) => atr.Name === "custom:wallet_address"
    )?.Value;
    return walletAddress || "";
  }, [attributes]);

  return (
    <Button
      onClick={() => {
        navigate("/mypage");
      }}
      variant="outlined"
      style={{ fontSize: "1.4rem", flexDirection: "column" }}
    >
      {user.getUsername()}
      <WalletAddressDisplay
        address={walletAddress}
        style={{ fontSize: "1rem" }}
      />
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

const LoadingAuthDisplay = () => {
  return (
    <Grid container direction="row-reverse">
      <LoadingDisplay xs={4} />
    </Grid>
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
        <Grid container direction="row-reverse" alignItems="center" spacing={1}>
          <AuthProvider
            contentOnUnauthenticated={<AuthButtons />}
            contentWhileLoadingSession={<LoadingAuthDisplay />}
          >
            <Grid item xs={2}>
              <AcountInfo />
            </Grid>
            <Grid item xs={2}>
              <Button
                onClick={() => {
                  navigate("/articles/new");
                }}
                style={{ fontSize: "1.4rem" }}
              >
                create article
              </Button>
            </Grid>
            <Grid item>
              <Button
                onClick={() => {
                  navigate("/search");
                }}
                style={{ fontSize: "1.4rem" }}
              >
                search
              </Button>
            </Grid>
          </AuthProvider>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Header;
