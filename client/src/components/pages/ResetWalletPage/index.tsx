import { Grid } from "@mui/material";
import ResetWalletForm from "~/components/organisms/forms/ResetWalletForm";

/**
 * "/reset-wallet"で表示されるページコンポーネント
 */
const ResetWalletPage = () => {
  return (
    <Grid style={{ padding: "100px 400px" }}>
      <ResetWalletForm />
    </Grid>
  );
};

export default ResetWalletPage;
