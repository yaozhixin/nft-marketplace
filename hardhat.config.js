require("@nomiclabs/hardhat-waffle");
require("@nomicfoundation/hardhat-toolbox");

// Goerli testnet
const ALCHEMY_API_KEY = "rYGCIHTsrmwTW5B-ECCvio6mX84v9cAn";
const GOERLI_PRIVATE_KEY = "d1980fc7870601b15cda3c15ec50d690ef59447251e7c5debec72747b7241ec9";

module.exports = {
  solidity: "0.8.4",
  networks: {
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [GOERLI_PRIVATE_KEY]
    }
  },
  paths: {
    artifacts: "./src/backend/artifacts",
    sources: "./src/backend/contracts",
    cache: "./src/backend/cache",
    tests: "./src/backend/test"
  },
};
