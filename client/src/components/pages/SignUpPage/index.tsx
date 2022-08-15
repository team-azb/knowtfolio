import { useCallback, useState } from "react";
import {
  signUpToCognito,
  SignUpForm,
  confirmSigningUpToCognito,
} from "~/apis/cognito";

const SignUpPage = () => {
  const [form, setForm] = useState<SignUpForm>({
    email: "",
    password: "",
    username: "",
  });
  const [hasSignUp, setHasSignUp] = useState(false);
  const [code, setCode] = useState("");

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
        default:
          break;
      }
    },
    []
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
