import HeaderLayout from "~/components/organisms/layouts/HeaderLayout";
import ResetPasswordForm from "~/components/organisms/forms/ResetPasswordForm";

/**
 * "/reset-password"で表示されるページコンポーネント
 */
const ResetPasswordPage = () => {
  return (
    <HeaderLayout>
      <div style={{ padding: "100px 400px" }}>
        <ResetPasswordForm />
      </div>
    </HeaderLayout>
  );
};

export default ResetPasswordPage;
