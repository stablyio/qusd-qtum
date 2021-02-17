module.exports = {
  plugins: ["solidity-coverage"],

  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    local: {
      host: "127.0.0.1",
      network_id: "*",
      port: 8545,
      gas: 6700000,
      gasPrice: 0x01,
    },
    coverage: {
      host: "localhost",
      network_id: "*",
      port: 8555,
      gas: 10000000000000,
      gasPrice: 0x01,
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
