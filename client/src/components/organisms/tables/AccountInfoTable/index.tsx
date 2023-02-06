import { useCallback } from "react";
import { useAuthContext } from "~/components/organisms/providers/AuthProvider";
import { signOutFromCognito } from "~/apis/cognito";
import WalletAddressDisplay from "~/components/organisms/WalletAddressDisplay";
import { useNavigate } from "react-router-dom";
import { Button, Grid } from "@mui/material";
import { toast } from "react-toastify";
import IconImage from "~/components/atoms/IconImage";

/**
 * ユーザー情報を表示するテーブル
 */
const AccountInfoTable = () => {
  const {
    user,
    attributes: { phoneNumber, email, website, description, picture },
    userWalletAddress,
  } = useAuthContext();
  const navigate = useNavigate();

  const signOut = useCallback(async () => {
    try {
      await signOutFromCognito(user);
      navigate("/signin", {
        state: { shouldLoadCurrentUser: true },
      });
      toast.success("サインアウトしました。");
    } catch (error) {
      console.error(error);
      toast.error("サインアウトに失敗しました。");
    }
  }, [navigate, user]);

  return (
    <Grid item container direction="column" spacing={2}>
      <Grid item>
        <h2>Account info</h2>
        <hr />
      </Grid>
      <Grid item container spacing={5}>
        <Grid item>
          <IconImage url={picture} />
        </Grid>
        <Grid item flexGrow={1}>
          <Grid container direction="column" spacing={2}>
            <Grid item container>
              <Grid xs={2}>Username</Grid>
              <Grid xs={10}>{user.getUsername()}</Grid>
            </Grid>
            <Grid item container>
              <Grid xs={2}>Phone number</Grid>
              <Grid xs={10}>{phoneNumber}</Grid>
            </Grid>
            <Grid item container>
              <Grid xs={2}>Email</Grid>
              <Grid xs={10}>{email || "-"}</Grid>
            </Grid>
            <Grid item container>
              <Grid xs={2}>Website</Grid>
              <Grid xs={10}>
                {website ? (
                  <a href={website} style={{ color: "#000" }}>
                    {website}
                  </a>
                ) : (
                  "-"
                )}
              </Grid>
            </Grid>
            <Grid item container>
              <Grid xs={2}>Biography</Grid>
              <Grid xs={10}>{description || "-"}</Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item container spacing={1}>
        <Grid item>
          <Button
            variant="outlined"
            onClick={() => {
              navigate("/settings/profile");
            }}
            style={{ fontSize: "1.4rem" }}
          >
            アカウント情報を編集
          </Button>
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
      <Grid item>
        <h2>Wallet info</h2>
        <hr />
      </Grid>
      <Grid item container alignItems="center">
        <Grid xs={2}>Address</Grid>
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
                navigate("/settings/wallet");
              }}
              style={{ marginLeft: "1rem", fontSize: "1.4rem" }}
            >
              登録する
            </Button>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default AccountInfoTable;
