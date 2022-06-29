import styles from "./style.module.css";
import { greeting } from "./helper";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";

const HelloWeb3 = () => {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Reload when account is changed
    window.ethereum.on("accountsChanged", () => {
      // Handle the new accounts, or lack thereof.
      window.location.reload();
    });
    // Reload when chain is changed
    window.ethereum.on("chainChanged", () => {
      // Handle the new chain.
      window.location.reload();
    });
  }, []);

  const connectMetamask = useCallback(async () => {
    const provider = await detectEthereumProvider({ mustBeMetaMask: true });
    if (provider && window.ethereum?.isMetaMask) {
      console.log("Welcome to MetaMask User🎉");
      const web3 = new Web3(Web3.givenProvider);
      // connect with metamask wallet
      const accounts = await web3.eth.requestAccounts();
      const account = accounts[0];

      const balance = await web3.eth.getBalance(accounts[0]);

      setAccount(account);
      setBalance(web3.utils.fromWei(balance));
      setIsConnected(true);
      greeting();
    } else {
      console.log("Please Install MetaMask🙇‍♂️");
    }
  }, []);

  // Initialize connection with contract and wallet
  useEffect(() => {
    connectMetamask();
  }, [connectMetamask]);

  return (
    <div>
      <h1 className={styles.title}>hello web3!!</h1>
      {isConnected ? (
        <>
          <p>your account: {account}</p>
          <p>your balance: {balance}</p>
        </>
      ) : (
        "未接続"
      )}
      <div>
        <Link to="/signup">signup</Link>
      </div>
    </div>
  );
};

export default HelloWeb3;
