import RevalidationCodeForm from "~/components/organisms/forms/RevalidationCodeForm";
import HeaderLayout from "~/components/organisms/layouts/HeaderLayout";

const RevalidationCodePage = () => {
  return (
    <HeaderLayout>
      <div style={{ padding: "100px 400px" }}>
        <RevalidationCodeForm />
      </div>
    </HeaderLayout>
  );
};

export default RevalidationCodePage;
