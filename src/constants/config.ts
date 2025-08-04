export const APP_CONFIG = {
  name: "Coinbase CDP Swap Widget",
  description:
    "A production-ready swap widget built with Coinbase Developer Platform",
  version: "1.0.0",
  author: "Coinbase Developer Platform",
} as const;

export const API_CONFIG = {
  retryAttempts: 3,
  timeout: 10000,
  staleTime: 60 * 1000, // 1 minute
} as const;

export const SWAP_CONFIG = {
  PRICE_REFRESH_INTERVAL: 10 * 1000, // 10 seconds - auto-refresh swap quotes
  BALANCE_REFRESH_INTERVAL: 30 * 1000, // 30 seconds - auto-refresh token balances
  DEFAULT_SLIPPAGE_BPS: 100, // 1% slippage tolerance
} as const;

export const VALIDATION_CONFIG = {
  otpLength: 6,
  emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

export const BASE_CHAIN = {
  id: 8453,
  name: "Base",
  network: "base",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://mainnet.base.org"] },
    public: { http: ["https://mainnet.base.org"] },
  },
} as const;

export const TRANSACTION_CONFIG = {
  confirmationTimeout: 60000, // 60 seconds
} as const;

// Onramp Configuration
export const ONRAMP_CONFIG = {
  baseUrl: "https://pay.coinbase.com/buy/select-asset",
  defaultNetwork: "base",
  defaultAsset: "USDC",
  defaultFiatCurrency: "USD",
  defaultPaymentMethod: "CARD",
  minAmount: 1, // Minimum $1 USD
  maxAmount: 500, // Maximum $500 USD for guest checkout
  sessionTokenExpiry: 120, // 2 minutes
} as const;

export const NETWORKS: Record<
  string,
  { name: string; logoUrl: string; explorerUrl: string }
> = {
  Base: {
    name: "Base",
    logoUrl: "/icons/base.svg",
    explorerUrl: "https://basescan.org",
  },
} as const;
