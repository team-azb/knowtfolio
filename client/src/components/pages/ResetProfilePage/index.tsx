import { Grid } from "@mui/material";
import UpdateProfileForm from "~/components/organisms/forms/UpdateProfileForm";
import HeaderLayout from "~/components/organisms/layouts/HeaderLayout";

/**
 * "/settings/profile"で表示されるページコンポーネント
 */
const ResetProfilePage = () => {
  return (
    <HeaderLayout>
      <Grid style={{ padding: "100px 400px" }}>
        <UpdateProfileForm />
      </Grid>
    </HeaderLayout>
  );
};

export default ResetProfilePage;
