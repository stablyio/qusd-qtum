var HDWalletProvider = require("truffle-hdwallet-provider");

const devPrivateKey = "cMoScV7xZ3LcnFVdbmw3B8UgBBzdtjoQdHMqm6RWnV1UeHmR3KGD"; // qTCPwBmjcPkixHKv4H2CDEYCRZZCfgeVNb OR 0x69b92c2b01cc7a0ca134cafba39d68ec68f10762

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
      gasPrice: 0x01,
    },
    localJanus: {
      host: "localhost",
      port: 23889,
      network_id: "*",
      gasPrice: "0x64",
    },
    remoteJanusTestnet: {
      // host: "ec2-34-222-247-128.us-west-2.compute.amazonaws.com",
      // port: 23890,
      network_id: "*",
      gasPrice: "0x64",
      networkCheckTimeout: 10000,
      provider: function() {
        return new HDWalletProvider(
          devPrivateKey,
          "http://ec2-34-222-247-128.us-west-2.compute.amazonaws.com:23890"
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
