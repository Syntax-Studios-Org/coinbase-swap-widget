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

export const SUPPORTED_ONRAMP_NETWORKS = {
  base: {
    name: "Base",
    chainId: 8453,
    blockchainIdentifier: "base",
  },
} as const;

export const SUPPORTED_ONRAMP_ASSETS = {
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    networks: ["base"],
  },
} as const;

export const SUPPORTED_FIAT_CURRENCIES = {
  USD: {
    symbol: "USD",
    name: "US Dollar",
    code: "USD",
  },
} as const;

export const ONRAMP_PAYMENT_METHODS = {
  CARD: "Credit/Debit Card",
  ACH_BANK_ACCOUNT: "Bank Account (ACH)",
  APPLE_PAY: "Apple Pay",
  CRYPTO_ACCOUNT: "Coinbase Account",
  FIAT_WALLET: "Coinbase Wallet",
} as const;

export const NETWORKS = {
  Base: {
    name: "Base",
    logoUrl: "/icons/base.svg",
  },
} as const;
