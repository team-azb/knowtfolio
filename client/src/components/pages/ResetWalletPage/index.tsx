import { Grid } from "@mui/material";
import ResetWalletForm from "~/components/organisms/forms/ResetWalletForm";
import HeaderLayout from "~/components/organisms/layouts/HeaderLayout";

/**
 * "/reset-wallet"で表示されるページコンポーネント
 */
const ResetWalletPage = () => {
  return (
    <HeaderLayout>
      <Grid style={{ padding: "100px 400px" }}>
        <ResetWalletForm />
      </Grid>
    </HeaderLayout>
  );
};

export default ResetWalletPage;
