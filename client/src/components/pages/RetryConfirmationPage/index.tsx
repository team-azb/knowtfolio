import RetryConfirmationForm from "~/components/organisms/forms/RetryConfirmationForm";
import HeaderLayout from "~/components/organisms/layouts/HeaderLayout";

const RetryConfirmationPage = () => {
  return (
    <HeaderLayout>
      <div style={{ padding: "100px 400px" }}>
        <RetryConfirmationForm />
      </div>
    </HeaderLayout>
  );
};

export default RetryConfirmationPage;
