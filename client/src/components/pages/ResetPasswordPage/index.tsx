import { Grid } from "@mui/material";
import ResetPasswordForm from "~/components/organisms/forms/ResetPasswordForm";
import HeaderLayout from "~/components/organisms/layouts/HeaderLayout";

/**
 * "settings/password"で表示されるページコンポーネント
 */
const ResetPasswordPage = () => {
  return (
    <HeaderLayout>
      <Grid style={{ padding: "100px 400px" }}>
        <ResetPasswordForm />
      </Grid>
    </HeaderLayout>
  );
};

export default ResetPasswordPage;
