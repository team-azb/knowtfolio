import "./style.css";
import { greeting } from "./helper";
import { useEffect } from "react";

const HelloWeb3 = () => {
  useEffect(() => {
    greeting();
  }, []);
  return <h1 className="title">hello web3!!</h1>;
};

export default HelloWeb3;
