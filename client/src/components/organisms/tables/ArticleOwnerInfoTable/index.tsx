import { Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getUser, UserInfo } from "~/apis/lambda";
import IconImage from "~/components/atoms/IconImage";
import WalletAddressDisplay from "../../WalletAddressDisplay";
import LinkIcon from "@mui/icons-material/Link";
import { useNavigate } from "react-router-dom";

type articleOwnerInfoTableProps = {
  ownerId: string;
};

/**
 * 記事オーナーのアカウント情報を表示するコンポーネント
 * @ownerId オーナーのuserId
 */
const ArticleOwnerInfoTable = ({ ownerId }: articleOwnerInfoTableProps) => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    username: "",
    icon_url: "",
    website_url: "",
    biography: "",
    wallet_address: "",
  });
  useEffect(() => {
    (async () => {
      try {
        const user = await getUser(ownerId);
        setUserInfo(user);
      } catch (error) {
        toast.error("ご指定のユーザーを見つけられませんでした。");
      }
    })();
  }, [ownerId]);
  const navigate = useNavigate();

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item container>
        <Grid
          item
          xs={3}
          onClick={() => {
            navigate(`/users/${ownerId}`);
          }}
          style={{ cursor: "pointer" }}
        >
          <IconImage size={60} url={userInfo.icon_url} />
        </Grid>
        <Grid
          item
          xs={9}
          container
          direction="column"
          spacing={1}
          style={{ wordBreak: "break-all" }}
        >
          <Grid item>
            <b>{userInfo.username}</b>
          </Grid>
          <Grid item>
            {userInfo.wallet_address && (
              <WalletAddressDisplay address={userInfo.wallet_address} />
            )}
          </Grid>
          <Grid item>
            {userInfo.website_url && (
              <LinkIcon
                fontSize="large"
                onClick={() => {
                  window.open(userInfo.website_url);
                }}
                style={{ cursor: "pointer" }}
              />
            )}
          </Grid>
        </Grid>
      </Grid>
      <Grid item>{userInfo.biography}</Grid>
    </Grid>
  );
};

export default ArticleOwnerInfoTable;
