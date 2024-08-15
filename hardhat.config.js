require("@nomicfoundation/hardhat-toolbox");
require("hardhat-tracer");
require("./task/e2e");
require("./task/pingpong");
require("hardhat-change-network");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    fsepolia: {
      url: "http://127.0.0.1:8545",
    },
    flukso: {
      url: "http://127.0.0.1:8544",
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },

    lukso: {
      url: "https://rpc.testnet.lukso.network",
      accounts: [process.env.PRIVATE_KEY],
    },
    // fmainnet: {
    //   url: "http://127.0.0.1:8545",
    // },
    // flukso: {
    //   url: "http://127.0.0.1:8544",
    // },
  },
  solidity: {
    version: "0.8.24",
    settings: {
      viaIR: true,
    },
  },
};
