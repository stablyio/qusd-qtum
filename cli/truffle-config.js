var HDWalletProvider = require("truffle-hdwallet-provider");
var PrivateKeyProvider = require("truffle-privatekey-provider");
var CoinKey = require("coinkey");

const devPrivateKey = "cMbgxCJrTYUqgcmiC1berh5DFrtY1KeU4PXZ6NZxgenniF1mXCRk"; // qUbxboqjBRp96j3La8D1RYkyqx5uQbJPoW

module.exports = {
  plugins: ["solidity-coverage"],

  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    coverage: {
      host: "localhost",
      network_id: "*",
      port: 8555,
      gas: 10000000000000,
      gasPrice: "0x32",
    },
    testnet:{
      host: "localhost",
      port: 3889,
      network_id: "*",
      gasPrice: "0x32",
      networkCheckTimeout: 30000,
      from: "0x69b92c2b01cc7a0ca134cafba39d68ec68f10762",
    },
    localJanus: {
      host: "localhost",
      port: 23889,
      // cMbgxCJrTYUqgcmiC1berh5DFrtY1KeU4PXZ6NZxgenniF1mXCRk
      // provider: function() {
      //   const pk = CoinKey.fromWif("cMbgxCJrTYUqgcmiC1berh5DFrtY1KeU4PXZ6NZxgenniF1mXCRk");
      //   return new PrivateKeyProvider(
      //   pk.privateKey.toString("hex"),
      //   "http://localhost:23889"
      // );
      // },
      network_id: "*",
      from: "0x7926223070547d2d15b2ef5e7383e541c338ffe9",
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
