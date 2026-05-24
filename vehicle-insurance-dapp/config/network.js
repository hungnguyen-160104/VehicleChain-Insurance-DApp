import { polygon, holesky, localhost } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

export const config = getDefaultConfig({
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Vehicle Insurance DApp",
  projectId: projectId,
  chains: [localhost],
  ssr: true,
});

export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_LOCALHOST;

const networkEnv = process.env.NEXT_PUBLIC_NETWORK || "localhost";
export const NETWORK_NAME =
  networkEnv === "holesky" ? "Holesky Testnet" : "Localhost (Hardhat)";
