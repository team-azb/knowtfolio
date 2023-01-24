import { Button, Grid } from "@mui/material";
import { useCallback, useState } from "react";
import {
  signInToCognitoWithPassword,
  signInToCognitoWithWallet,
} from "~/apis/cognito";
import Form from "~/components/atoms/authForm/Form";
import Input from "~/components/atoms/authForm/Input";
import Label from "~/components/atoms/authForm/Label";
import Spacer from "~/components/atoms/Spacer";
import {
  assertMetamask,
  useWeb3Context,
} from "~/components/organisms/providers/Web3Provider";
import WalletAddressDisplay from "../../WalletAddressDisplay";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import MetamaskButton from "~/components/atoms/MetamaskButton";
import ConnectToMetamaskButton from "~/components/organisms/ConnectToMetamaskButton";
import RequireWeb3Wrapper from "~/components/organisms/RequireWeb3Wrapper";

type signInWithPasswordForm = {
  username: string;
  password: string;
};

const SignInForm = () => {
  const [form, setForm] = useState<signInWithPasswordForm>({
    username: "",
    password: "",
  });
  const { isConnectedMetamask, account, web3 } = useWeb3Context();
  const navigate = useNavigate();

  const onChangeForm = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      switch (event.target.name) {
        case "username":
        case "password":
          setForm((prev) => {
            return { ...prev, [event.target.name]: event.target.value };
          });
          break;
        default:
          break;
      }
    },
    []
  );

  const signInWithPassword = useCallback<
    React.MouseEventHandler<HTMLButtonElement>
  >(
    async (event) => {
      event.preventDefault();
      try {
        await signInToCognitoWithPassword(form.username, form.password);
        navigate("/mypage", {
          state: {
            shouldLoadCurrentUser: true,
          },
        });
        toast.success("サインインしました。");
      } catch (error) {
        console.error(error);
        toast.error("サインインに失敗しました。");
      }
    },
    [form.password, form.username, navigate]
  );

  const signInWithWallet = useCallback<
    React.MouseEventHandler<HTMLButtonElement>
  >(
    async (event) => {
      event.preventDefault();
      try {
        assertMetamask(isConnectedMetamask);
        await signInToCognitoWithWallet(form.username, web3, account);
        navigate("/mypage", {
          state: {
            shouldLoadCurrentUser: true,
          },
        });
        toast.success("サインインしました。");
      } catch (error) {
        console.error(error);
        toast.error("サインインに失敗しました。");
      }
    },
    [account, form.username, isConnectedMetamask, navigate, web3]
  );

  return (
    <Form>
      <h2>サインイン</h2>
      <hr />
      <Spacer height="3rem" />
      <Grid item container spacing={3}>
        <Input
          name="username"
          id="username"
          onChange={onChangeForm}
          value={form.username}
          label="Username"
          type="text"
        />
        <Grid item container direction="row">
          <Grid item container direction="column" xs={5} spacing={3}>
            <Input
              name="password"
              id="password"
              onChange={onChangeForm}
              value={form.password}
              type="password"
              label="Password"
            />
            <Grid item container justifyContent="center">
              <Button
                variant="outlined"
                onClick={signInWithPassword}
                style={{ fontSize: "1.4rem" }}
              >
                Sign in
              </Button>
            </Grid>
          </Grid>
          <Grid
            item
            container
            alignItems="center"
            justifyContent="center"
            xs={2}
          >
            <b>OR</b>
          </Grid>
          <Grid item container xs={5}>
            <RequireWeb3Wrapper
              isConnectedMetamask={isConnectedMetamask}
              contentOnNotConnected={
                <Grid item container direction="column">
                  <Label>Connect to Metamask</Label>
                  <ConnectToMetamaskButton />
                </Grid>
              }
            >
              <Grid item container direction="column">
                <Label>Connected wallet address</Label>
                <WalletAddressDisplay
                  shouldTruncate={false}
                  address={account}
                  style={{ fontSize: "1.4rem" }}
                />
                <MetamaskButton onClick={signInWithWallet}>
                  Sign in with metamask
                </MetamaskButton>
              </Grid>
            </RequireWeb3Wrapper>
          </Grid>
        </Grid>
        <Grid item container justifyContent="center">
          <p>
            まだアカウントを持っていない方は
            <Link to="/signup" style={{ color: "#000" }}>
              サインアップ
            </Link>
            へ
          </p>
        </Grid>
      </Grid>
    </Form>
  );
};

export default SignInForm;
