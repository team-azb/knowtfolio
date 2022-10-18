const Label = ({
  htmlFor,
  children,
  style,
}: React.DetailedHTMLProps<
  React.LabelHTMLAttributes<HTMLLabelElement>,
  HTMLLabelElement
>) => {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        fontSize: "2rem",
        fontWeight: "bold",
        ...style,
      }}
    >
      {children}
    </label>
  );
};

export default Label;
