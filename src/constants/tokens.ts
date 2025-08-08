import type { Token } from "@/types/swap";

// ===== Base Tokens =====
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
};

// ===== Ethereum Mainnet Tokens =====
export const ETHEREUM_TOKENS: Record<string, Token> = {
  ETH: {
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    logoUrl: "/icons/eth.svg",
  },
  USDC: {
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    logoUrl: "/icons/usdc.svg",
  },
  WETH: {
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18,
    logoUrl: "/icons/weth.svg",
  },
  DAI: {
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    symbol: "DAI",
    name: "Dai Stablecoin",
    decimals: 18,
    logoUrl: "/icons/dai.svg",
  },
};


export const SUPPORTED_NETWORKS = {
  base: BASE_TOKENS,
  ethereum: ETHEREUM_TOKENS,
} as const;

export type SupportedNetwork = keyof typeof SUPPORTED_NETWORKS;
