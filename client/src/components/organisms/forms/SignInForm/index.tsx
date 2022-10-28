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
import { useWeb3Context } from "~/components/organisms/providers/Web3Provider";
import metamaskSvg from "~/assets/metamask.svg";
import WalletAddressDisplay from "../../WalletAddressDisplay";

type signInWithPasswordForm = {
  username: string;
  password: string;
};

const SignInForm = () => {
  const [form, setForm] = useState<signInWithPasswordForm>({
    username: "",
    password: "",
  });
  const { account, web3 } = useWeb3Context();

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
        alert("サインイン成功");
        window.location.reload();
      } catch (error) {
        console.error(error);
        alert("サインイン失敗");
      }
    },
    [form.password, form.username]
  );

  const signInWithWallet = useCallback<
    React.MouseEventHandler<HTMLButtonElement>
  >(
    async (event) => {
      event.preventDefault();
      try {
        await signInToCognitoWithWallet(form.username, web3, account);
        alert("サインイン成功");
        window.location.reload();
      } catch (error) {
        console.error(error);
        alert("サインイン失敗");
      }
    },
    [account, form.username, web3]
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
            <Grid item container direction="column">
              <Label>Connected wallet address</Label>
              <WalletAddressDisplay
                isTrancated={false}
                address={account}
                style={{ fontSize: "1.4rem" }}
              />
            </Grid>
            <Grid item container alignItems="center" justifyContent="center">
              <Button
                variant="outlined"
                onClick={signInWithWallet}
                style={{ fontSize: "1.4rem" }}
              >
                <img
                  src={metamaskSvg}
                  alt="metamask_icon"
                  style={{ height: 40, marginRight: 10 }}
                />
                Sign in with metamask
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Form>
  );
};

export default SignInForm;
