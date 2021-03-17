var HDWalletProvider = require("truffle-hdwallet-provider");

const devPrivateKey = "cMbgxCJrTYUqgcmiC1berh5DFrtY1KeU4PXZ6NZxgenniF1mXCRk"; // qUbxboqjBRp96j3La8D1RYkyqx5uQbJPoW

module.exports = {
  plugins: ["solidity-coverage"],

  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // Match any network id
      disableConfirmationListener: true, // Workaround to avoid issue with excessive eth_getBlockByNumber calls: https://github.com/trufflesuite/truffle/issues/3471 https://github.com/trufflesuite/truffle/issues/3522 https://github.com/trufflesuite/truffle/issues/2688
    },
    coverage: {
      host: "localhost",
      network_id: "*",
      port: 8555,
      gas: 10000000000000,
      gasPrice: "0x32",
    },
    localJanus: {
      host: "localhost",
      port: 23889,
      network_id: "*",
      gasPrice: "0x32",
    },
    remoteJanusTestnet: {
      host: "ec2-34-222-247-128.us-west-2.compute.amazonaws.com",
      port: 23890,
      network_id: "*",
      gasPrice: "0x32",
      networkCheckTimeout: 30000,
      from: "0x69b92c2b01cc7a0ca134cafba39d68ec68f10762",
    },
    remoteJanusMainnet: {
      network_id: "*",
      gasPrice: "0x32",
      networkCheckTimeout: 10000,
      provider: function() {
        return new HDWalletProvider(
          "TODO MAINNET LEDGER DEVICE",
          "http://ec2-34-222-247-128.us-west-2.compute.amazonaws.com:23889"
        );
      },
    },
  },
  compilers: {
    solc: {
      version: "v0.6.12",
    },
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
};
