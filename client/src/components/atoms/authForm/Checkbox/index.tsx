import { Checkbox as MuiCheckbox, Grid } from "@mui/material";

type checkboxProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  label?: JSX.Element;
};

/**
 * 認証用フォームのためのスタイルが適用されたCheckbox要素
 */
const Checkbox = ({ name, id, disabled, onChange, label }: checkboxProps) => {
  return (
    <Grid item container alignItems="center">
      <MuiCheckbox
        disabled={disabled}
        name={name}
        id={id}
        onChange={onChange}
        sx={{
          padding: "0.5rem",
          transform: "scale(1.4)",
        }}
      />
      <label htmlFor={id} style={{ lineHeight: "1.8rem", fontSize: "1.8rem" }}>
        {label}
      </label>
    </Grid>
  );
};

export default Checkbox;
