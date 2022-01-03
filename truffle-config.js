require("dotenv").config();

const getNetworkProvider = () => {
  let HDWalletProvider = require("@truffle/hdwallet-provider");
  let mnemonic = process.env.TRUFFLE_MNEMONIC;
  return new HDWalletProvider(mnemonic, process.env.ETH_NODE_URL);
};

module.exports = {
    compilers: {
      solc: {
        version: '0.8.4',
        settings: {
          optimizer: {
            enabled: true, // Default: false
            runs: 200      // Default: 200
          },
        }
      }
    },
    contracts_directory: './contracts/climatedao/', //change this depending on what you're trying to deploy
    contracts_build_directory: './contracts/climatedao/build/', //change this depending on what you're trying to deploy
    contracts_artifacts_directory: './artifacts/',
    networks: {
      development: {
        host: '127.0.0.1',
        port: 8545,
        gas: 6721975, // <-- Use this high gas value
        gasPrice: 1000000000,    // <-- Use this low gas price
        network_id: '*', // Match any network id
      },
      rinkeby: {
        provider: getNetworkProvider,
        network_id: 4,
        gasPrice: 10000000000,
        skipDryRun: true,
      },
    },
  
    mocha: {
      enableTimeouts: false,
      before_timeout: 120000 // 2min
    }
  }