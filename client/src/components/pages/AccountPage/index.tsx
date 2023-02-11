import { Grid } from "@mui/material";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import HeaderLayout from "~/components/organisms/layouts/HeaderLayout";
import AuthProvider, {
  useAuthContext,
} from "~/components/organisms/providers/AuthProvider";
import AccountInfoTable from "~/components/organisms/tables/AccountInfoTable";
import MyAccountInfoTable from "~/components/organisms/tables/MyAccountInfoTable";
import MyOwnedArticlesTable from "~/components/organisms/tables/MyOwnedArticlesTable";
import OwnedArticlesTable from "~/components/organisms/tables/OwnedArticlesTable";

/**
 * 自分のアカウントページ、編集が可能
 */
const MyAccountPage = () => {
  return (
    <HeaderLayout>
      <div style={{ padding: "100px 400px" }}>
        <Grid container direction="column" spacing={3}>
          <MyAccountInfoTable />
          <MyOwnedArticlesTable />
        </Grid>
      </div>
    </HeaderLayout>
  );
};

/**
 * 他人のアカウントページ、公開情報の閲覧のみ
 */
const OtherAccountPage = () => {
  const { userId = "" } = useParams();
  return (
    <HeaderLayout>
      <div style={{ padding: "100px 400px" }}>
        <Grid container direction="column" spacing={3}>
          <AccountInfoTable userId={userId} />
          <OwnedArticlesTable userId={userId} />
        </Grid>
      </div>
    </HeaderLayout>
  );
};

/**
 * 認証情報によってアカウントページの内容を切り替えるコンポーネント
 */
const ConditionalAccountPageContent = () => {
  const { userId } = useParams();
  const { user } = useAuthContext();
  const isMypage = useMemo(() => {
    return user.getUsername() === userId;
  }, [user, userId]);
  return <>{isMypage && userId ? <MyAccountPage /> : <OtherAccountPage />}</>;
};

/**
 * "/users/:userId"のページコンポーネント
 */
const AccountPage = () => {
  return (
    <AuthProvider contentOnUnauthenticated={<OtherAccountPage />}>
      <ConditionalAccountPageContent />
    </AuthProvider>
  );
};

export default AccountPage;
