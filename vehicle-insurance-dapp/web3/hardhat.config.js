require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const HOLESKY_RPC_URL =
  process.env.HOLESKY_RPC_URL || "https://ethereum-holesky-rpc.publicnode.com";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
      // Base fee = 0 để MetaMask không cảnh báo phí gas trên localhost
      // (fix lỗi nút Confirm bị khóa / "Review alert" đỏ không bấm được)
      initialBaseFeePerGas: 0,
    },
    holesky: {
      url: HOLESKY_RPC_URL,
      accounts: PRIVATE_KEY !== "" ? [PRIVATE_KEY] : [],
      chainId: 17000,
      gasPrice: 20000000000, // 20 gwei
      gas: 8000000,
      timeout: 60000,
      confirmations: 2,
    },
  },
};
