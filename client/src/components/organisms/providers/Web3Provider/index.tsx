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
import { CONTRACT_ADDRESS } from "~/configs/blockchain";
// json file in blockchain directory
import Knowtfolio from "../../../../../../blockchain/artifacts/contracts/Knowtfolio.sol/Knowtfolio.json";

type web3Context =
  | {
      web3?: Web3;
      account?: string;
      contract?: Contract;
      connectMetamask?: () => Promise<void>;
      isConnectedMetamask: false;
    }
  | {
      web3: Web3;
      account: string;
      contract: Contract;
      connectMetamask: () => Promise<void>;
      isConnectedMetamask: true;
    };
const web3Context = createContext<web3Context>({ isConnectedMetamask: false });

type props = {
  children: React.ReactNode;
  contentOnUnconnected?: React.ReactNode;
};
const Web3Provider = ({ children }: props) => {
  const [web3Obj, setWeb3Obj] = useState<web3Context>({
    isConnectedMetamask: false,
  });

  const connectMetamask = useCallback(async () => {
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
      connectMetamask,
      isConnectedMetamask: true,
    });
  }, []);

  // Initialize connection with contract and wallet
  useEffect(() => {
    (async () => {
      const provider = await detectEthereumProvider({ mustBeMetaMask: true });
      if (provider && window.ethereum?.isMetaMask) {
        // Connect to Metamask
        connectMetamask();
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
        setWeb3Obj((prev) => {
          return {
            ...prev,
            connectMetamask,
          };
        });
      } else {
        console.log("Please Install MetaMask🙇‍♂️");
      }
    })();
  }, [connectMetamask]);

  const content = useMemo(() => {
    return (
      <web3Context.Provider value={web3Obj}>{children}</web3Context.Provider>
    );
  }, [children, web3Obj]);

  return <>{content}</>;
};

export default Web3Provider;
export const useWeb3Context = () => {
  return useContext(web3Context);
};
