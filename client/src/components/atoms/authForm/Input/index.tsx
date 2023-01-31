import { Grid } from "@mui/material";
import { grey } from "@mui/material/colors";
import Label from "../Label";

export const InputStyle: React.CSSProperties = {
  fontSize: "1.5rem",
  height: 30,
  border: `1px solid ${grey[500]}`,
  borderRadius: 3,
  paddingLeft: 5,
};

type inputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  label?: string;
  message?: string | JSX.Element;
};

/**
 * 認証用フォームのためのスタイルが適用されたInput要素
 */
const Input = ({
  name,
  type,
  id,
  disabled,
  onChange,
  placeholder,
  style,
  label,
  message,
}: inputProps) => {
  return (
    <Grid item container direction="column">
      <Label htmlFor={id}>{label}</Label>
      <input
        disabled={disabled}
        type={type}
        name={name}
        id={id}
        onChange={onChange}
        placeholder={placeholder}
        style={{ ...InputStyle, ...style }}
      />
      <label htmlFor={id}>{message}</label>
    </Grid>
  );
};

export default Input;
