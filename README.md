# Coinbase CDP Swap & Onramp Widget

A production-ready swap and onramp widget built with Coinbase Developer Platform (CDP) that enables seamless token swapping and crypto purchasing on Base network. Features a modern dark theme design with Coinbase Sans fonts and comprehensive error handling.

## Features

### 🔄 Token Swapping
- **Multi-token Support**: Swap between ETH, USDC, DAI, WETH and other supported tokens on Base
- **Real-time Quotes**: Live pricing with automatic refresh every 10 seconds
- **Smart Routing**: Optimal swap routes for best prices and lowest fees
- **Slippage Control**: Customizable slippage tolerance settings
- **Transaction Review**: Detailed transaction preview with fee breakdown
- **Precise Balance Handling**: Accurate MAX button without rounding errors

### 💳 Onramp Integration
- **Buy Crypto**: Purchase crypto directly with fiat currency
- **Coinbase Integration**: Seamless integration with Coinbase onramp services
- **Multiple Payment Methods**: Support for various payment options
- **Instant Availability**: Quick crypto delivery to your wallet
- **Session Management**: Secure onramp session handling

### 🔐 Security & Authentication
- **Email Authentication**: Simple OTP-based wallet access
- **Secure Approvals**: Precise token allowances instead of unlimited permissions
- **Transaction Confirmation**: Proper on-chain confirmation with timeouts
- **Error Handling**: Comprehensive error states using swap quote issues

## Architecture

### Component Structure

```
src/
├── app/
│   ├── api/            # API routes for swap quotes and balances
│   ├── globals.css     # Global styles and CSS variables
│   ├── layout.tsx      # Root layout with providers
│   └── page.tsx        # Main application page
├── components/
│   ├── auth/           # Authentication components
│   ├── swap/           # Swap interface components
│   └── ui/             # Reusable UI components
├── constants/          # Application configuration
├── hooks/              # Custom React hooks for swap logic
├── lib/                # Blockchain utilities and helpers
├── providers/          # React context providers
├── services/           # API service layer
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

### Key Components

#### Swap Components
- **SwapWidget**: Main swap interface with modular design
- **SwapInput**: Reusable input component with error styling and precise balance handling
- **TokenSelector**: Token selection modal with search and balance display
- **ReviewTransactionModal**: Complete transaction review with success/failure states

#### Onramp Components
- **OnrampButton**: Entry point for crypto purchases with gradient border
- **OnrampModal**: Integrated purchasing flow with session management

#### UI Components
- **ErrorState**: Standardized error display for insufficient balance
- **ConnectWalletModal**: Email and OTP authentication interface
- **Custom UI Library**: Button, Input, Dialog components with dark theme

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Coinbase Developer Platform API keys

### Environment Setup

1. Copy the environment template:

```bash
cp .env.example .env.local
```

2. Configure your environment variables:

```env
# Frontend Configuration
NEXT_PUBLIC_CDP_PROJECT_ID=your_cdp_project_id

# Backend API Configuration
CDP_API_KEY_ID=your_api_key_id
CDP_API_KEY_SECRET=your_api_key_secret
CDP_WALLET_SECRET=your_wallet_secret
```

### Installation

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Development

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Security Features

### Precise Token Approvals

The application implements security best practices by approving only the exact amount needed for each swap, rather than unlimited allowances. This significantly reduces the attack surface for users.

### Transaction Confirmation

All transactions are properly confirmed on-chain using `waitForTransactionReceipt` with configurable timeouts, ensuring reliable execution and preventing race conditions.

### Type Safety

Comprehensive TypeScript coverage eliminates runtime errors and provides excellent developer experience with full IntelliSense support.

### Network Configuration

Dynamic network support with proper chain ID validation and RPC endpoint configuration.

## API Routes

### Swap APIs
- `POST /api/swap/quote` - Get swap price quotes with liquidity and fee information
- `POST /api/swap/create-quote` - Create executable swap quotes with transaction data
- `POST /api/balances` - Fetch token balances for connected wallets

### Onramp APIs
- `POST /api/onramp/session` - Create and manage onramp sessions for crypto purchases

## Supported Networks & Tokens

### Networks
- **Base**: Primary network for swaps and onramp

### Tokens
- **ETH**: Ethereum
- **USDC**: USD Coin
- **DAI**: Dai Stablecoin
- **WETH**: Wrapped Ethereum
- *Additional tokens configurable in `/src/constants/tokens.ts`*

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Blockchain**: viem for Ethereum interactions
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query for server state, React hooks for local state
- **Authentication**: Coinbase CDP Hooks
- **Type Safety**: TypeScript with strict configuration
- **UI Components**: Custom component library with Radix UI primitives

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode requirements
- Implement proper error boundaries and handling
- Use semantic component and function naming
- Add comprehensive type definitions for all APIs
- Test transaction flows on testnets before mainnet

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:

- [Coinbase Developer Platform Documentation](https://docs.cdp.coinbase.com/)
- [CDP Hooks Documentation](https://docs.cdp.coinbase.com/cdp-hooks/docs/welcome)
- [GitHub Issues](https://github.com/coinbase/cdp-swap-widget/issues)

## Acknowledgments

- [Coinbase Developer Platform](https://developers.coinbase.com/)
- [Next.js](https://nextjs.org/)
- [viem](https://viem.sh/)
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com/)
