require("@nomicfoundation/hardhat-toolbox");
require("hardhat-tracer");
require("./task/forkTest/e2e");
require("./task/forkTest/tokene2e");
require("./task/deploy");
require("./task/setup/hookAndIsm");
require("./task/setup/hashiManager");
require("hardhat-change-network");
require("hardhat-gas-reporter");
require("hardhat-tracer");
require("dotenv").config();
// require("@nomicfoundation/hardhat-foundry");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111,
    },

    lukso: {
      url: process.env.LUKSO_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 42,
    },
    ethereum: {
      url: process.env.ETHEREUM_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
    luksotestnet: {
      url: "https://rpc.testnet.lukso.network",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 4201,
    },
    gnosis: {
      url: "https://rpc.gnosischain.com",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 100,
    },
    fethereum: { url: "http://127.0.0.1:8545" },
    flukso: { url: "http://127.0.0.1:8544" },
  },
  etherscan: {
    apiKey: {
      lukso: "",
      ethereum: process.env.ETHERSCAN_API_KEY || "",
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      gnosis: process.env.GNOSISSCAN_API_KEY || "",
      xdai: process.env.GNOSISSCAN_API_KEY || "",
      sepolia: process.env.ETHERSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "lukso",
        chainId: 42,
        urls: {
          apiURL: "https://explorer.execution.mainnet.lukso.network/api",
          browserURL: "https://explorer.execution.mainnet.lukso.network/",
        },
      },
      {
        network: "luksotestnet",
        chainId: 4201,
        urls: {
          apiURL: "https://api.explorer.execution.testnet.lukso.network/api",
          browserURL: "https://explorer.execution.testnet.lukso.network",
        },
      },
    ],
  },
  solidity: {
    version: "0.8.25",
    settings: { viaIR: true, optimizer: { enabled: true, runs: 200 } },
  },
};
