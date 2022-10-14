import React, { useCallback, useState } from "react";
import {
  signUpToCognito,
  SignUpForm,
  confirmSigningUpToCognito,
} from "~/apis/cognito";
import { useWeb3Context } from "~/components/organisms/providers/Web3Provider";
import PhoneInput from "react-phone-number-input/input";
import { E164Number } from "libphonenumber-js/types";
import { AxiosError } from "axios";

/**
 * 参考:
 * https://docs.aws.amazon.com/sdk-for-go/api/service/cognitoidentityprovider/#CognitoIdentityProvider.SignUp
 * 上記のtypesに加えて、電話番号が重複した場合に返す"PhoneNumberExistsException"を追加している。こちらはlambdaでカスタムして実装
 */
type signUpErrorTypes =
  | "UsernameExistsException"
  | "PhoneNumberExistsException"
  | "InvalidPasswordException";

const translateSignUpErrorMessage = (message: string) => {
  const prefix = message.split(":")[0] as signUpErrorTypes;
  switch (prefix) {
    case "UsernameExistsException":
      return "すでに登録されたユーザーネームです";
    case "PhoneNumberExistsException":
      return "すでに登録された電話番号です";
    case "InvalidPasswordException":
      return "パスワードが条件を満たしていません";
    default:
      return message;
  }
};

const SignUpForm = () => {
  const [form, setForm] = useState<SignUpForm>({
    phone: "",
    password: "",
    username: "",
  });
  const [hasSignedUp, setHasSignedUp] = useState(false);
  const [code, setCode] = useState("");
  const { account } = useWeb3Context();

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
          if (event.target.checked) {
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
        alert("successfully signed up!");
        setHasSignedUp(true);
      } catch (error) {
        if (error instanceof AxiosError) {
          const message = translateSignUpErrorMessage(
            String(error.response?.data)
          );
          alert(message);
        } else {
          alert("sign up failed...");
        }
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
      } catch (error) {
        alert("verification failed...");
      }
    },
    [form, code]
  );

  return (
    <>
      <form>
        <div>
          username
          <input
            disabled={hasSignedUp}
            type="text"
            name="username"
            onChange={onChangeForm}
          />
        </div>
        <div>
          phone number
          <PhoneInput
            onChange={onChangePhoneNumberInput}
            country="JP"
            disabled={hasSignedUp}
            value={form.phone}
          />
        </div>
        <div>
          password
          <input
            disabled={hasSignedUp}
            type="text"
            name="password"
            onChange={onChangeForm}
            value={form.password}
          />
        </div>
        <div>
          <input
            disabled={hasSignedUp}
            type="checkbox"
            name="wallet"
            id="wallet"
            onChange={onChangeForm}
          />
          <label htmlFor="wallet">
            <b>{account}</b>をwallet addressとして登録する(オプション)
          </label>
        </div>
        <div>
          <button disabled={hasSignedUp} onClick={submitForm}>
            submit
          </button>
        </div>
        {hasSignedUp && (
          <>
            <div>
              confirmation code
              <input onChange={onChangeCodeInput} type="text" value={code} />
            </div>
            <div>
              <button onClick={verifyCode}>verify</button>
            </div>
          </>
        )}
      </form>
    </>
  );
};

export default SignUpForm;