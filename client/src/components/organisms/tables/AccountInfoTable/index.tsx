import { Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getUser, PublicUserInfo } from "~/apis/lambda";
import IconImage from "~/components/atoms/IconImage";
import WalletAddressDisplay from "../../WalletAddressDisplay";

type accountInfoTableProps = {
  userId: string;
};

/**
 * ユーザー情報を表示するテーブル
 */
const AccountInfoTable = ({ userId }: accountInfoTableProps) => {
  const [userInfo, setUserInfo] = useState<PublicUserInfo>({
    username: "",
    picture: "",
    website: "",
    biography: "",
    wallet_address: "",
  });
  useEffect(() => {
    (async () => {
      try {
        const user = await getUser(userId);
        setUserInfo(user);
      } catch (error) {
        toast.error("ご指定のユーザーを見つけられませんでした。");
      }
    })();
  }, [userId]);

  return (
    <Grid item container direction="column" spacing={2}>
      <Grid item>
        <h2>Account info</h2>
        <hr />
      </Grid>
      <Grid item container spacing={5}>
        <Grid item>
          <IconImage url={userInfo.picture} />
        </Grid>
        <Grid item flexGrow={1}>
          <Grid container direction="column" spacing={2}>
            <Grid item container>
              <Grid xs={2}>Username</Grid>
              <Grid xs={10}>{userInfo.username || "-"}</Grid>
            </Grid>
            <Grid item container>
              <Grid xs={2}>Website</Grid>
              <Grid xs={10}>
                {userInfo.website ? (
                  <a href={userInfo.website} style={{ color: "#000" }}>
                    {userInfo.website}
                  </a>
                ) : (
                  "-"
                )}
              </Grid>
            </Grid>
            <Grid item container>
              <Grid xs={2}>Biography</Grid>
              <Grid xs={10}>{userInfo.biography || "-"}</Grid>
            </Grid>
            <Grid item container>
              <Grid xs={2}>Wallet address</Grid>
              <Grid xs={10}>
                <WalletAddressDisplay
                  address={userInfo.wallet_address}
                  shouldTruncate={true}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default AccountInfoTable;
