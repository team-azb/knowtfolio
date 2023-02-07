import { Grid } from "@mui/material";
import ResetProfileForm from "~/components/organisms/forms/ResetProfileForm";
import HeaderLayout from "~/components/organisms/layouts/HeaderLayout";

/**
 * "/settings/profile"で表示されるページコンポーネント
 */
const ResetProfilePage = () => {
  return (
    <HeaderLayout>
      <Grid style={{ padding: "100px 400px" }}>
        <ResetProfileForm />
      </Grid>
    </HeaderLayout>
  );
};

export default ResetProfilePage;