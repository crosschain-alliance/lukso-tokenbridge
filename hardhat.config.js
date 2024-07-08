require("@nomicfoundation/hardhat-toolbox");
require("hardhat-tracer");
require("./task/e2e");
require("hardhat-change-network");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    // hardhat: {
    //   forking: {
    //     url: "http://127.0.0.1:8545", //process.env.GNOSIS_JSON_RPC_URL,
    //   },
    //   chainId: 1,
    // },

    fmainnet: {
      url: "http://127.0.0.1:8545",
    },
    flukso: {
      url: "http://127.0.0.1:8544",
    },
  },
  solidity: {
    version: "0.8.24",
    settings: {
      viaIR: true,
    },
  },
};
