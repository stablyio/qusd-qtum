import tokenABI from "./abis/QUSD.abi.json";
import issuerABI from "./abis/QUSDIssuer.abi.json";

const config = {
  web3: {
    endpoint: {
      ropsten: "",
      mainnet: "",
    },
  },
  token: {
    address: {
      ropsten: "",
      mainnet: "",
    },
    abi: tokenABI,
    decimals: 6,
  },
  issuer: {
    address: {
      ropsten: "",
      mainnet: "",
    },
    abi: issuerABI,
  },
};

export default config;
