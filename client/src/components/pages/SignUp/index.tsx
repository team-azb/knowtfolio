import { useCallback, useState } from "react";
import { signUpCognito, form, confirmSignUpCognito } from "./helper";

const SignUp = () => {
  const [form, setForm] = useState<form>({
    email: "",
    password: "",
    username: "",
    phoneNumber: "",
  });
  const [hasSignUp, setHasSignUp] = useState(false);
  const [code, setCode] = useState("");

  const changeForm = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      switch (event.target.name) {
        case "email":
          setForm((prev) => {
            return { ...prev, email: event.target.value };
          });
          break;
        case "password":
          setForm((prev) => {
            return { ...prev, password: event.target.value };
          });
          break;
        case "username":
          setForm((prev) => {
            return { ...prev, username: event.target.value };
          });
          break;
        case "phonenumber":
          setForm((prev) => {
            return { ...prev, phoneNumber: event.target.value };
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
      await signUpCognito(form);
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
      await confirmSignUpCognito(form.username, code);
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
        phonenumber
        <input
          disabled={hasSignUp}
          type="text"
          name="phonenumber"
          onChange={changeForm}
          value={form.phoneNumber}
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

export default SignUp;
