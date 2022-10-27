// import { Grid } from "@mui/material";
// import { useMemo } from "react";
// import { useNavigate } from "react-router-dom";
// import Form from "~/components/atoms/authForm/Form";
// import Spacer from "~/components/atoms/Spacer";
import SignInForm from "~/components/organisms/forms/SignInForm";
// import WalletSignInForm from "~/components/organisms/forms/WalletSignInForm";
// import { useQuery } from "~/helpers/reactRouter";

const SignInPage = () => {
  // const query = useQuery();
  // const signInMethod = useMemo(() => {
  //   return query.get("method") || "password";
  // }, [query]);
  // const navigate = useNavigate();

  // const onChangeSigninMethodSelect = useCallback<
  //   React.ChangeEventHandler<HTMLSelectElement>
  // >(
  //   (event) => {
  //     navigate(`/signin?method=${event.target.value}`);
  //   },
  //   [navigate]
  // );

  // const signinForm = useMemo(() => {
  //   switch (signInMethod) {
  //     case "password":
  //       return <PasswordSignInForm />;
  //     case "wallet":
  //       return <WalletSignInForm />;
  //     default:
  //       return <PasswordSignInForm />;
  //   }
  // }, [signInMethod]);

  return (
    <div style={{ padding: "100px 400px" }}>
      <SignInForm />
    </div>
  );
};

export default SignInPage;
