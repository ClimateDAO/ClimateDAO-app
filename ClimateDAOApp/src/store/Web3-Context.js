import React from "react";

const Web3Context = React.createContext({
  walletAddress: "",
  provider: "",
  signer: "",
  governorContract: "",
  connectWallet: () => {},
  checkIfWalletConnected: () => {},
});

export default Web3Context;
