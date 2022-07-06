import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";

const defaultContentOnUnconnected = <div>metamaskに接続してください</div>;

type web3Context = {
  web3: Web3;
  account: string;
};
const web3Context = createContext<web3Context>({} as web3Context);

type props = {
  children: React.ReactNode;
  contentOnUnconnected?: React.ReactNode;
};
const Web3Provider = ({
  children,
  contentOnUnconnected = defaultContentOnUnconnected,
}: props) => {
  const [web3Obj, setWeb3Obj] = useState<web3Context | null>(null);

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

      setWeb3Obj({
        web3,
        account,
      });
    } else {
      console.log("Please Install MetaMask🙇‍♂️");
    }
  }, []);

  // Initialize connection with contract and wallet
  useEffect(() => {
    connectMetamask();
  }, [connectMetamask]);

  const content = useMemo(() => {
    if (web3Obj) {
      return (
        <web3Context.Provider value={web3Obj}>{children}</web3Context.Provider>
      );
    } else {
      return contentOnUnconnected;
    }
  }, [children, contentOnUnconnected, web3Obj]);

  return <>{content}</>;
};

export default Web3Provider;
export const useWeb3Context = () => {
  return useContext(web3Context);
};
