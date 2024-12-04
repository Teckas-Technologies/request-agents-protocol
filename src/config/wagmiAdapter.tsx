"use client";

import { cookieStorage, createStorage } from "wagmi";
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, arbitrum, sepolia } from '@reown/appkit/networks';
import { PROJECT_ID } from "./constants";

export const projectId = PROJECT_ID;

if (!projectId) {
    throw new Error("Project ID is not defined!")
}

export const networks = [mainnet, arbitrum, sepolia]

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig