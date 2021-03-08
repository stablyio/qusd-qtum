import tokenABI from "./abis/QUSD.abi.json";
import issuerABI from "./abis/QUSDIssuer.abi.json";

const config = {
  web3: {
    endpoint: {
      ropsten:
        "http://ec2-34-222-247-128.us-west-2.compute.amazonaws.com:23890",
      mainnet: "",
    },
  },
  token: {
    address: {
      ropsten: "0xeCD1A1B8e5D1a5EdE4f1b302Ab7BE233d576D996",
      mainnet: "",
    },
    abi: tokenABI,
    decimals: 6,
  },
  issuer: {
    address: {
      ropsten: "0x132945aa88de21807F1A2589FC58Ea19490905A3",
      mainnet: "",
    },
    abi: issuerABI,
  },
};

export default config;
