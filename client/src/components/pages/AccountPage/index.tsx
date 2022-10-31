import { Grid } from "@mui/material";
import AccountInfoTable from "~/components/organisms/tables/AccountInfoTable";
import OwnedArticleTable from "~/components/organisms/tables/OwnedArticleTable";

/**
 * "/mypage"のページコンポーネント
 */
const AccountPage = () => {
  return (
    <div style={{ padding: "100px 400px" }}>
      <Grid container direction="column" spacing={3}>
        <AccountInfoTable />
        <OwnedArticleTable />
      </Grid>
    </div>
  );
};

export default AccountPage;
