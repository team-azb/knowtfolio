import SignUpForm from "~/components/organisms/forms/SignUpForm";
import HeaderLayout from "~/components/organisms/layouts/HeaderLayout";

const SignUpPage = () => {
  return (
    <HeaderLayout>
      <div
        style={{
          padding: "100px 400px",
        }}
      >
        <SignUpForm />
      </div>
    </HeaderLayout>
  );
};

export default SignUpPage;
