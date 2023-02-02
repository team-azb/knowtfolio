import HeaderLayout from "~/components/organisms/layouts/HeaderLayout";
import ResetPasswordWithCodeForm from "~/components/organisms/forms/ResetPasswordWithCodeForm";

const ForgotPasswordPage = () => {
  return (
    <HeaderLayout>
      <div style={{ padding: "100px 400px" }}>
        <ResetPasswordWithCodeForm />
      </div>
    </HeaderLayout>
  );
};

export default ForgotPasswordPage;
