import HeaderLayout from "~/components/organisms/layouts/HeaderLayout";
import ResetPasswordForm from "~/components/organisms/forms/ResetPasswordForm";

const ForgotPasswordPage = () => {
  return (
    <HeaderLayout>
      <div style={{ padding: "100px 400px" }}>
        <ResetPasswordForm />
      </div>
    </HeaderLayout>
  );
};

export default ForgotPasswordPage;
