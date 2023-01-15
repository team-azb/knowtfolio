import React, { useCallback, useState } from "react";
import {
  signUpToCognito,
  SignUpForm,
  confirmSigningUpToCognito,
} from "~/apis/cognito";
import PhoneInput from "react-phone-number-input/input";
import { E164Number } from "libphonenumber-js/types";
import { Button, Grid } from "@mui/material";
import Input, { InputStyle } from "~/components/atoms/authForm/Input";
import Label from "~/components/atoms/authForm/Label";
import Form from "~/components/atoms/authForm/Form";
import Spacer from "~/components/atoms/Spacer";

export const noteOnWalletAddress =
  "※一度連携したwallet addressは後から変更・削除できません。必ず正しいwallet addressが表示されているかどうかよく確認してから登録してください。";

const SignUpForm = () => {
  const [form, setForm] = useState<SignUpForm>({
    phone: "",
    password: "",
    username: "",
  });
  const [hasSignedUp, setHasSignedUp] = useState(false);
  const [code, setCode] = useState("");

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
        default:
          break;
      }
    },
    []
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
        alert("successfully signed up!");
        setHasSignedUp(true);
      } catch (error) {
        // TODO: Display user friendly error.
        alert(`sign up failed: ${error}`);
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
        alert("successfully verifyed code!");
        // TODO: サインインして/wallet-registerへ遷移させる
      } catch (error) {
        alert("verification failed...");
      }
    },
    [form, code]
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
      </Grid>
    </Form>
  );
};

export default SignUpForm;
