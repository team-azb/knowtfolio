import { useCallback, useMemo } from "react";
import { useAuthContext } from "~/components/organisms/providers/AuthProvider";
import { signOutFromCognito } from "~/apis/cognito";
import WalletAddressDisplay from "~/components/organisms/WalletAddressDisplay";
import { useNavigate } from "react-router-dom";
import { Button, Grid } from "@mui/material";
import HeaderLayout from "~/components/organisms/layouts/HeaderLayout";

/**
 * "/mypage"のページコンポーネント
 */
const AccountPage = () => {
  const { user, attributes, userWalletAddress } = useAuthContext();
  const phoneNumber = useMemo(() => {
    const phoneNumber = attributes.find(
      (atr) => atr.Name === "phone_number"
    )?.Value;
    return phoneNumber;
  }, [attributes]);

  const signOut = useCallback(async () => {
    await signOutFromCognito(user);
    window.location.reload();
  }, [user]);

  const navigate = useNavigate();

  return (
    <HeaderLayout>
      <Grid
        container
        direction="column"
        spacing={2}
        style={{ padding: "100px 400px" }}
      >
        <Grid item>
          <h2>Account info</h2>
          <hr />
        </Grid>
        <Grid item container>
          <Grid xs={2}>Username</Grid>
          <Grid xs={10}>{user.getUsername()}</Grid>
        </Grid>
        <Grid item container>
          <Grid xs={2}>Phone number</Grid>
          <Grid xs={10}>{phoneNumber}</Grid>
        </Grid>
        <Grid item container alignItems="center">
          <Grid xs={2}>Wallet address</Grid>
          <Grid xs={10}>
            {userWalletAddress ? (
              <WalletAddressDisplay
                style={{ display: "inline" }}
                address={userWalletAddress}
                shouldTruncate={false}
              />
            ) : (
              <Button
                variant="outlined"
                onClick={() => {
                  navigate("/reset-wallet");
                }}
                style={{ marginLeft: "1rem", fontSize: "1.4rem" }}
              >
                登録する
              </Button>
            )}
          </Grid>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            onClick={signOut}
            style={{ fontSize: "1.4rem" }}
          >
            sign out
          </Button>
        </Grid>
      </Grid>
    </HeaderLayout>
  );
};

export default AccountPage;
