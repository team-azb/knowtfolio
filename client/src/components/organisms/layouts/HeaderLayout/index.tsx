import { ReactNode } from "react";
import Header from "~/components/organisms/Header";

type headerLayoutProps = {
  children: ReactNode;
};
const HeaderLayout = ({ children }: headerLayoutProps) => {
  return (
    <>
      <Header />
      {children}
    </>
  );
};

export default HeaderLayout;
