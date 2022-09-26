import { useCallback, useState } from "react";
import {
  signUpToCognito,
  SignUpForm,
  confirmSigningUpToCognito,
} from "~/apis/cognito";
import { useWeb3Context } from "~/components/organisms/providers/Web3Provider";

const SignUpPage = () => {
  const [form, setForm] = useState<SignUpForm>({
    email: "",
    password: "",
    username: "",
  });
  const [hasSignUp, setHasSignUp] = useState(false);
  const [code, setCode] = useState("");
  const { account } = useWeb3Context();

  const changeForm = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      switch (event.target.name) {
        case "email":
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

  const submitForm = useCallback(async () => {
    try {
      await signUpToCognito(form);
      alert("successfully signed up!");
      setHasSignUp(true);
    } catch (error) {
      alert("sign-up failed...");
      console.error(error);
    }
  }, [form]);

  const changeCode = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      setCode(event.target.value);
    },
    []
  );

  const verifyCode = useCallback(async () => {
    try {
      await confirmSigningUpToCognito(form.username, code);
      alert("successfully verifyed code!");
    } catch (error) {
      alert("verification failed...");
    }
  }, [form, code]);

  return (
    <div>
      <div>
        username
        <input
          disabled={hasSignUp}
          type="text"
          name="username"
          onChange={changeForm}
        />
      </div>
      <div>
        email
        <input
          disabled={hasSignUp}
          type="text"
          name="email"
          onChange={changeForm}
          value={form.email}
        />
      </div>
      <div>
        password
        <input
          disabled={hasSignUp}
          type="text"
          name="password"
          onChange={changeForm}
          value={form.password}
        />
      </div>
      <div>
        <input
          type="checkbox"
          name="wallet"
          id="wallet"
          onChange={changeForm}
        />
        <label htmlFor="wallet">
          <b>{account}</b>をwallet addressとして登録する(オプション)
        </label>
      </div>
      <div>
        <button onClick={submitForm}>submit</button>
      </div>
      {hasSignUp && (
        <>
          <div>
            confirmation code
            <input onChange={changeCode} type="text" value={code} />
          </div>
          <div>
            <button onClick={verifyCode}>verify</button>
          </div>
        </>
      )}
    </div>
  );
};

export default SignUpPage;
