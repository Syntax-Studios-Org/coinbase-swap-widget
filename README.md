# Coinbase CDP Swap Widget

A production-ready token swap interface built with the Coinbase Developer Platform (CDP). This application demonstrates secure, efficient token swapping with proper transaction confirmation and comprehensive type safety.

## Features

- **Secure Token Swapping**: Implements precise allowance approvals instead of unlimited token permissions
- **CDP Integration**: Built on Coinbase Developer Platform hooks for authentication and transaction management
- **Email Authentication**: Secure OTP-based authentication flow
- **Real-time Price Quotes**: Live token swap pricing with automatic updates

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

- **SwapWidget**: Main container managing swap state and quote fetching
- **SwapForm**: Token selection and amount input interface
- **SwapExecution**: Secure transaction execution with proper confirmations
- **TokenSelector**: Multi-network token selection with balance display
- **AuthForm**: Email and OTP authentication interface

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

- `POST /api/swap/quote` - Get swap price quotes with liquidity and fee information
- `POST /api/swap/create-quote` - Create executable swap quotes with transaction data
- `POST /api/balances` - Fetch token balances for connected wallets

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
