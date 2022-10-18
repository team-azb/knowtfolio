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
};

const Input = ({
  name,
  type,
  id,
  disabled,
  onChange,
  placeholder,
  style,
  label,
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
    </Grid>
  );
};

export default Input;
