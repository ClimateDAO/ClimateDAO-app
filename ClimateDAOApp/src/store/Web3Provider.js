import Web3Context from "./Web3-Context";
import React, { useReducer, useCallback } from "react";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import * as contracts from "../utils/contract_abis";
const { ethers } = require("ethers");

const poly = {
  chainId: `0x${Number(137).toString(16)}`,
  chainName: "Polygon-Mainnet",
  nativeCurrency: {
    name: "Polygon Native Token",
    symbol: "MATIC",
    decimals: 18,
  },
  rpcUrls: [
    "https://rpc-mainnet.matic.network",
    "https://matic-mainnet.chainstacklabs.com",
    "https://rpc-mainnet.maticvigil.com",
    "https://rpc-mainnet.matic.quiknode.pro",
    "https://matic-mainnet-full-rpc.bwarelabs.com",
  ],
  blockExplorerUrls: ["https://polygonscan.com/"],
};

const defaultWeb3State = {
  walletAddress: "",
  provider: "",
  signer: "",
  governorContract: "",
};

const web3Reducer = (state, action) => {
  if (action.type === "WALLET_CONNECT") {
    console.log("Wallet Connect ACTION");

    const walletAddress = action.walletAddress;
    const provider = action.provider;
    const signer = action.signer;
    const ethersContracts = action.contracts;
    return {
      walletAddress: walletAddress,
      provider: provider,
      signer: signer,
      governorContract: ethersContracts.govenorContract,
    };
  }

  return defaultWeb3State;
};

const Web3Provider = (props) => {
  const [web3State, dispatchWeb3Action] = useReducer(
    web3Reducer,
    defaultWeb3State
  );

  const changeNetwork = async ({ networkName, setError }) => {
    console.log("Attempting to change network");
    try {
      if (!window.ethereum) throw new Error("No crypto wallet found");
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            ...poly,
          },
        ],
      });
    } catch (err) {
      console.log(err.message);
    }
  };

  const instantiateContracts = (signer) => {
    const governorContract = new ethers.Contract(
      contracts.governorAddress,
      contracts.governorAbi,
      signer
    );

    return {
      govenorContract: governorContract,
    };
  };

  const connectWalletHandler = useCallback(async () => {
    try {
      const { ethereum } = window;
      const providerOptions = {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            infuraId: "27e484dcd9e3efcfd25a83a78777cdf1",
          },
        },
      };

      const web3Modal = new Web3Modal({
        cacheProvider: false, // optional
        providerOptions, // required
        disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
      });

      await web3Modal.connect();
      // Get a Web3 instance for the wallet
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      const providerEthers = new ethers.providers.Web3Provider(ethereum); // Allows for interaction with ethereum nodes - read/write
      const signer = providerEthers.getSigner(); // Abstraction of the Ethereum Account which can be used to sign messages and transactions and send signed transactions

      // if (window.ethereum.networkVersion !== 137) {
      //   changeNetwork("poly");
      // }

      dispatchWeb3Action({
        type: "WALLET_CONNECT",
        walletAddress: accounts[0],
        provider: providerEthers,
        signer: signer,
        contracts: instantiateContracts(signer),
      });
    } catch (error) {
      console.log(error);
    }
  }, []);

  const checkIfWalletIsConnectedHandler = useCallback(async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        return;
      }

      /*
       * Check if we're authorized to access the user's wallet
       */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      // if (window.ethereum.networkVersion !== 137) {
      //   changeNetwork("poly");
      // }

      if (accounts.length !== 0) {
        const provider = new ethers.providers.Web3Provider(ethereum); // Allows for interaction with ethereum nodes - read/write
        const signer = provider.getSigner(); // Abstraction of the Ethereum Account which can be used to sign messages and transactions and send signed transactions

        dispatchWeb3Action({
          type: "WALLET_CONNECT",
          walletAddress: accounts[0],
          provider: provider,
          signer: signer,
          contracts: instantiateContracts(signer),
        });
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  const web3Context = {
    walletAddress: web3State.walletAddress,
    provider: web3State.provider,
    signer: web3State.signer,
    governorContract: web3State.governorContract,
    connectWallet: connectWalletHandler,
    checkIfWalletConnected: checkIfWalletIsConnectedHandler,
  };

  return (
    <Web3Context.Provider value={web3Context}>
      {props.children}
    </Web3Context.Provider>
  );
};

export default Web3Provider;
