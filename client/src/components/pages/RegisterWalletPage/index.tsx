import { Grid } from "@mui/material";
import RegisterWalletForm from "~/components/organisms/forms/RegisterWalletForm";
import HeaderLayout from "~/components/organisms/layouts/HeaderLayout";

/**
 * "/settings/wallet"で表示されるページコンポーネント
 */
const RegisterWalletPage = () => {
  return (
    <HeaderLayout>
      <Grid style={{ padding: "100px 400px" }}>
        <RegisterWalletForm />
      </Grid>
    </HeaderLayout>
  );
};

export default RegisterWalletPage;
