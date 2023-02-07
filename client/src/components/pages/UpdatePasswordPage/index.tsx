import { Grid } from "@mui/material";
import UpdatePasswordForm from "~/components/organisms/forms/UpdatePasswordForm";
import HeaderLayout from "~/components/organisms/layouts/HeaderLayout";

/**
 * "settings/password"で表示されるページコンポーネント
 */
const UpdatePasswordPage = () => {
  return (
    <HeaderLayout>
      <Grid style={{ padding: "100px 400px" }}>
        <UpdatePasswordForm />
      </Grid>
    </HeaderLayout>
  );
};

export default UpdatePasswordPage;
