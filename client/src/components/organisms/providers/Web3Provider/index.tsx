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
import { AbiItem } from "web3-utils";
import { Contract } from "web3-eth-contract";
import Knowtfolio from "@/contracts/Knowtfolio.sol/Knowtfolio.json";
import { CONTRACT_ADDRESS } from "~/configs/blockchain";

const defaultContentOnUnconnected = <div>metamaskに接続してください</div>;

type web3Context = {
  web3: Web3;
  account: string;
  contract: Contract;
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

      // setup instance to call contract with JSON RPC
      const contract = new web3.eth.Contract(
        Knowtfolio.abi as AbiItem[],
        CONTRACT_ADDRESS
      );

      setWeb3Obj({
        web3,
        account,
        contract,
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
