import SignInForm from "~/components/organisms/forms/SignInForm";
import HeaderLayout from "~/components/organisms/layouts/HeaderLayout";

const SignInPage = () => {
  return (
    <HeaderLayout>
      <div style={{ padding: "100px 400px" }}>
        <SignInForm />
      </div>
    </HeaderLayout>
  );
};

export default SignInPage;
