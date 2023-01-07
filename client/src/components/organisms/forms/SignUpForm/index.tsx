import React, { useCallback, useState } from "react";
import {
  signUpToCognito,
  SignUpForm,
  confirmSigningUpToCognito,
  signInToCognitoWithPassword,
} from "~/apis/cognito";
import { useWeb3Context } from "~/components/organisms/providers/Web3Provider";
import PhoneInput from "react-phone-number-input/input";
import { E164Number } from "libphonenumber-js/types";
import { Button, Grid } from "@mui/material";
import Input, { InputStyle } from "~/components/atoms/authForm/Input";
import Label from "~/components/atoms/authForm/Label";
import Checkbox from "~/components/atoms/authForm/Checkbox";
import Form from "~/components/atoms/authForm/Form";
import Spacer from "~/components/atoms/Spacer";
import WalletAddressDisplay from "~/components/organisms/WalletAddressDisplay";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import ConnectToMetamaskButton from "~/components/organisms/ConnectToMetamaskButton";

const SignUpForm = () => {
  const [form, setForm] = useState<SignUpForm>({
    phone: "",
    password: "",
    username: "",
  });
  const [hasSignedUp, setHasSignedUp] = useState(false);
  const [code, setCode] = useState("");
  const { account } = useWeb3Context();
  const navigate = useNavigate();

  const onChangeForm = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      switch (event.target.name) {
        case "phone":
        case "password":
        case "username":
          setForm((prev) => {
            return { ...prev, [event.target.name]: event.target.value };
          });
          break;
        case "wallet":
          if (event.target.checked && account) {
            setForm((prev) => {
              return { ...prev, wallet: account };
            });
          } else {
            setForm((prev) => {
              return { ...prev, wallet: undefined };
            });
          }
          break;
        default:
          break;
      }
    },
    [account]
  );

  const onChangePhoneNumberInput = useCallback((value: E164Number) => {
    setForm((prev) => {
      return {
        ...prev,
        phone: value,
      };
    });
  }, []);

  const submitForm = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    async (event) => {
      event.preventDefault();
      try {
        await signUpToCognito(form);
        setHasSignedUp(true);
        toast.success("登録した電話番号にコードを送信しました。");
      } catch (error) {
        // TODO: Display user friendly error.
        toast.error(`sign up failed: ${error}`);
      }
    },
    [form]
  );

  const onChangeCodeInput = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((event) => {
    setCode(event.target.value);
  }, []);

  const verifyCode = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    async (event) => {
      event.preventDefault();
      try {
        await confirmSigningUpToCognito(form.username, code);
        toast.success("認証コードの検証に成功しました。");
      } catch (error) {
        toast.error("認証コードの検証に失敗しました。");
        return;
      }

      try {
        await signInToCognitoWithPassword(form.username, form.password);
        toast.success("サインインしました。");
        navigate("mypage", {
          state: {
            shouldLoadCurrentUser: true,
          },
        });
      } catch (error) {
        toast.error("サインインに失敗しました。");
      }
    },
    [form.username, form.password, code, navigate]
  );

  return (
    <Form>
      <h2>サインアップ</h2>
      <hr />
      <Spacer height="3rem" />
      <Grid container direction="column" spacing={3}>
        <Input
          label="Username"
          disabled={hasSignedUp}
          type="text"
          name="username"
          id="username"
          onChange={onChangeForm}
          placeholder="Name used as display name"
        />
        <Grid item container direction="column">
          <Label htmlFor="phone_number">Phone number</Label>
          <PhoneInput
            onChange={onChangePhoneNumberInput}
            country="JP"
            id="phone_number"
            disabled={hasSignedUp}
            value={form.phone}
            style={InputStyle}
            placeholder="Phone number"
          />
        </Grid>
        <Input
          label="Password"
          disabled={hasSignedUp}
          type="password"
          name="password"
          id="password"
          onChange={onChangeForm}
          value={form.password}
          placeholder="Password"
        />
        {account ? (
          <Checkbox
            id="wallet"
            name="wallet"
            disabled={hasSignedUp}
            onChange={onChangeForm}
            label={
              <>
                <WalletAddressDisplay
                  address={account}
                  style={{ display: "inline" }}
                />
                をwallet addressとして登録する(option)
              </>
            }
          />
        ) : (
          <Grid item container>
            <Grid item xs={9}>
              {
                "Wallet addressをアカウントに紐付けるためにはMetamaskに接続する必要があります。"
              }
              <br />
              {
                "※アカウント作成後にWallet addressをアカウントに紐付けることも可能です。"
              }
            </Grid>
            <Grid item flexGrow={1}>
              <ConnectToMetamaskButton />
            </Grid>
          </Grid>
        )}
        <Grid item container justifyContent="center">
          <Button
            variant="outlined"
            disabled={hasSignedUp}
            onClick={submitForm}
            style={{ fontSize: "1.4rem" }}
          >
            Submit
          </Button>
        </Grid>
        {hasSignedUp && (
          <Grid
            item
            container
            justifyContent="center"
            alignItems="center"
            spacing={1}
          >
            <Grid item>
              <Input
                type="text"
                name="confirmation_code"
                id="confirmation_code"
                onChange={onChangeCodeInput}
                value={code}
                placeholder="Confirmation code"
              />
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                onClick={verifyCode}
                style={{ fontSize: "1.4rem" }}
              >
                verify
              </Button>
            </Grid>
          </Grid>
        )}
        <Grid item container justifyContent="center">
          <p>
            すでにアカウントを持っている方は
            <Link to="/signin" style={{ color: "#000" }}>
              サインイン
            </Link>
            へ
          </p>
        </Grid>
      </Grid>
    </Form>
  );
};

export default SignUpForm;
