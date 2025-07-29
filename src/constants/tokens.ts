import type { Token } from "@/types/swap";

export const BASE_TOKENS: Record<string, Token> = {
  ETH: {
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    logoUrl: "/icons/eth.svg",
  },
  USDC: {
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    logoUrl: "/icons/usdc.svg",
  },
  WETH: {
    address: "0x4200000000000000000000000000000000000006",
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18,
    logoUrl: "/icons/weth.svg",
  },
  DAI: {
    address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    symbol: "DAI",
    name: "Dai Stablecoin",
    decimals: 18,
    logoUrl: "/icons/dai.svg",
  },
} as const;

export const SUPPORTED_NETWORKS = {
  "base": BASE_TOKENS,
} as const;

export type SupportedNetwork = keyof typeof SUPPORTED_NETWORKS;
