"use client";

import { TokenSelector } from "./TokenSelector";
import type { Token, TokenBalance } from "@/types/swap";
import type { SupportedNetwork } from "@/constants/tokens";

interface SwapInputProps {
  label: string;
  token: Token | null;
  amount: string;
  onTokenSelect: (token: Token) => void;
  onAmountChange?: (amount: string) => void;
  balance?: TokenBalance | null;
  onMaxClick?: () => void;
  readOnly?: boolean;
  network: SupportedNetwork;
  excludeToken?: Token | null;
  hasError?: boolean;
}

export function SwapInput({
  label,
  token,
  amount,
  onTokenSelect,
  onAmountChange,
  balance,
  onMaxClick,
  readOnly = false,
  network,
  excludeToken,
  hasError = false
}: SwapInputProps) {
  return (
    <div className={`p-4 bg-[#141519] rounded-2xl ${hasError ? 'border border-[#DF6A70]' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-white/60 text-sm tracking-tight">{label}</span>
        {token && balance && (
          <div className="flex items-center space-x-2">
            <span className="text-white/60 text-sm tracking-tight">
              Bal: {(Number(balance.balance) / Math.pow(10, token.decimals)).toFixed(6)}
            </span>
            {onMaxClick && balance && (
              <button
                onClick={onMaxClick}
                className="text-[#4672ED] text-xs px-2 py-1 rounded-md transition-colors"
              >
                MAX
              </button>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center space-x-0 md:space-x-3">
        <input
          type={readOnly ? "text" : "number"}
          placeholder="0.00"
          value={amount}
          onChange={onAmountChange ? (e) => {
            const value = e.target.value;
            if (value === "" || (!isNaN(Number(value)) && Number(value) >= 0)) {
              onAmountChange(value);
            }
          } : undefined}
          onBlur={onAmountChange ? (e) => {
            const value = e.target.value;
            if (value && !isNaN(Number(value))) {
              const formatted = parseFloat(value).toString();
              onAmountChange(formatted);
            }
          } : undefined}
          readOnly={readOnly}
          className={`coinbase-sans bg-transparent placeholder-white/40 border-none outline-none flex-1 max-w-[205px] md:max-w-full text-2xl font-medium ${
            hasError ? 'text-[#DF6A70]' : 'text-white'
          }`}
          min="0"
          step="any"
        />
        <TokenSelector
          selectedToken={token}
          onTokenSelect={onTokenSelect}
          network={network}
          label="token"
          excludeToken={excludeToken}
        />
      </div>
    </div>
  );
}
