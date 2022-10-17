import { useCallback, useState } from "react";
import { signInToCognitoWithPassword } from "~/apis/cognito";

type signInWithPasswordForm = {
  username: string;
  password: string;
};

const PasswordSignInForm = () => {
  const [form, setForm] = useState<signInWithPasswordForm>({
    username: "",
    password: "",
  });

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

  const signIn = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
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

  return (
    <form>
      <div>
        username
        <input name="username" onChange={onChangeForm} value={form.username} />
      </div>
      <div>
        password
        <input
          name="password"
          onChange={onChangeForm}
          value={form.password}
          type="password"
        />
      </div>
      <div>
        <button onClick={signIn}>sign in</button>
      </div>
    </form>
  );
};

export default PasswordSignInForm;
