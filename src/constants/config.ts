export const APP_CONFIG = {
  name: "Coinbase CDP Swap Widget",
  description: "A production-ready swap widget built with Coinbase Developer Platform",
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
  name: 'Base',
  network: 'base',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mainnet.base.org'] },
    public: { http: ['https://mainnet.base.org'] }
  }
} as const;

export const TRANSACTION_CONFIG = {
  confirmationTimeout: 60000, // 60 seconds
} as const;
