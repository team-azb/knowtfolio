/**
 * 認証用フォームのためのスタイルが適用されたForm要素
 */
const Form = ({
  style,
  children,
}: React.DetailedHTMLProps<
  React.FormHTMLAttributes<HTMLFormElement>,
  HTMLFormElement
>) => {
  return (
    <form
      style={{
        borderStyle: "solid",
        borderWidth: 1,
        borderRadius: 10,
        padding: 20,
        ...style,
      }}
    >
      {children}
    </form>
  );
};

export default Form;
