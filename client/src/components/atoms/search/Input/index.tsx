import React from "react";

const Input = (
  props: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >
) => {
  return (
    <input
      style={{
        border: "2px solid #eee",
        borderRadius: "0.8rem",
        boxShadow: "none",
        boxSizing: "border-box",
        fontSize: "1.6rem",
        padding: "1rem",
        width: "100%",
      }}
      {...props}
    />
  );
};

export default Input;
