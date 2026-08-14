import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const rpcUrl = process.env.ALCHEMY_RPC_URL || "";
const privateKey = process.env.DEPLOYER_PRIVATE_KEY || "";
const formattedPrivateKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
      },
      evmVersion: "shanghai",
    },
  },
  networks: {
    amoy: {
      url: rpcUrl,
      accounts: privateKey ? [formattedPrivateKey] : [],
      chainId: 80002,
    },
  },
};

export default config;
