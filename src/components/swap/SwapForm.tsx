"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown } from "lucide-react";
import { formatUnits } from "viem";
import { Button, Input } from "@/components/ui";
import { TokenSelector } from "./TokenSelector";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { SUPPORTED_NETWORKS } from "@/constants/tokens";
import type { SupportedNetwork } from "@/constants/tokens";
import type { SwapQuote, Token } from "@/types/swap";

interface SwapFormProps {
  onSwap: () => void;
  isLoading: boolean;
  canSwap: boolean;
  quote: SwapQuote | null;
  isLoadingQuote: boolean;
  fromToken: Token | null;
  toToken: Token | null;
  fromAmount: string;
  network: string;
  setFromToken: (token: Token | null) => void;
  setToToken: (token: Token | null) => void;
  setFromAmount: (amount: string) => void;
  swapTokens: () => void;
}

export function SwapForm({
  onSwap,
  isLoading,
  canSwap,
  quote,
  isLoadingQuote,
  fromToken,
  toToken,
  fromAmount,
  network,
  setFromToken,
  setToToken,
  setFromAmount,
  swapTokens,
}: SwapFormProps) {
  const tokens = useMemo(() => Object.values(SUPPORTED_NETWORKS[network as SupportedNetwork]), [network]);
  const { data: balances } = useTokenBalances(
    network as SupportedNetwork,
    tokens,
  );

  const getTokenBalance = (tokenAddress: string) => {
    return balances?.find(
      (b) => b.token.address.toLowerCase() === tokenAddress.toLowerCase(),
    );
  };

  const handleMaxClick = () => {
    if (!fromToken) return;
    const balance = getTokenBalance(fromToken.address);
    if (balance) {
      setFromAmount(balance.formattedBalance);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-muted-foreground">
            From
          </label>
          {fromToken && (
            <div className="text-xs text-muted-foreground">
              Balance:{" "}
              {getTokenBalance(fromToken.address)?.formattedBalance ||
                "0.000000"}{" "}
              {fromToken.symbol}
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <div className="flex-1">
            <Input
              type="number"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="text-lg"
            />
          </div>
          <TokenSelector
            selectedToken={fromToken}
            onTokenSelect={setFromToken}
            network={network as SupportedNetwork}
            label="token"
            excludeToken={toToken}
          />
        </div>

        {fromToken && (
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={handleMaxClick}>
              Max
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={swapTokens}
          className="rounded-full"
        >
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-muted-foreground">To</label>
        <div className="flex space-x-2">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="0.0"
              value={
                quote && toToken
                  ? formatUnits(quote.toAmount, toToken.decimals)
                  : ""
              }
              readOnly
              className="text-lg bg-muted"
            />
          </div>
          <TokenSelector
            selectedToken={toToken}
            onTokenSelect={setToToken}
            network={network as SupportedNetwork}
            label="token"
            excludeToken={fromToken}
          />
        </div>
      </div>

      {isLoadingQuote && (
        <div className="text-center text-sm text-muted-foreground">
          Getting best price...
        </div>
      )}

      <Button
        onClick={onSwap}
        disabled={!canSwap}
        isLoading={isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? "Swapping..." : "Swap"}
      </Button>
    </div>
  );
}
