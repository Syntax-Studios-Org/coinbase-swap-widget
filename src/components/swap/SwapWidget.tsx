"use client";

import { useState, useMemo } from "react";
import { parseUnits } from "viem";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from "@/components/ui";
import { SwapForm } from "./SwapForm";
import { WalletInfo } from "./WalletInfo";
import { OnrampButton } from "./OnrampButton";
import {
  useSwapState,
  useCreateSwapQuote,
  useSwapPrice,
} from "@/hooks/useSwap";
import { useSwapExecution } from "@/hooks/useSwapExecution";
import { useEvmAddress, useIsSignedIn } from "@coinbase/cdp-hooks";
import { SUPPORTED_NETWORKS } from "@/constants/tokens";

export function SwapWidget() {
  const {
    fromToken,
    toToken,
    fromAmount,
    network,
    setFromToken,
    setToToken,
    setFromAmount,
    setNetwork,
    swapTokens,
  } = useSwapState();
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  const isSignedIn = useIsSignedIn();
  const evmAddress = useEvmAddress();
  const createSwapQuote = useCreateSwapQuote();
  const executeSwap = useSwapExecution();

  // Get swap price quote to check if swap is possible
  const parsedAmount = useMemo(() => {
    try {
      return fromToken && fromAmount && !isNaN(Number(fromAmount))
        ? parseUnits(fromAmount, fromToken.decimals)
        : BigInt(0);
    } catch (error) {
      console.error("Error parsing amount:", error);
      return BigInt(0);
    }
  }, [fromToken, fromAmount]);

  const { data: quote, isLoading: isLoadingQuote } = useSwapPrice(
    fromToken,
    toToken,
    parsedAmount,
    network,
    Boolean(fromToken && toToken && fromAmount),
  );

  const copyAddress = async () => {
    if (evmAddress) {
      await navigator.clipboard.writeText(evmAddress);
    }
  };

  const handleSwap = async () => {
    if (!fromToken || !toToken || !fromAmount) return;

    try {
      const swapQuote = await createSwapQuote.mutateAsync({
        fromToken: fromToken.address,
        toToken: toToken.address,
        fromAmount: parseUnits(fromAmount, fromToken.decimals),
        network,
        taker: evmAddress!,
        slippageBps: 100,
      });

      const result = await executeSwap.mutateAsync({
        swapQuote,
        fromTokenAddress: fromToken.address,
        network,
      });

      setLastTxHash(result.transactionHash);
    } catch (error) {
      console.error("Swap failed:", error);
    }
  };

  const canSwap = Boolean(
    isSignedIn &&
      fromToken &&
      toToken &&
      fromAmount &&
      quote &&
      !isLoadingQuote,
  );
  const isLoading = createSwapQuote.isPending || executeSwap.isPending;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Swap Tokens
          <OnrampButton />
        </CardTitle>

        {isSignedIn && evmAddress && (
          <WalletInfo address={evmAddress} onCopy={copyAddress} />
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Network
          </label>
          <select
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
            className="w-full p-2 border border-input rounded-md bg-background"
          >
            {Object.keys(SUPPORTED_NETWORKS).map((net) => (
              <option key={net} value={net}>
                {net.charAt(0).toUpperCase() + net.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <SwapForm
          onSwap={handleSwap}
          isLoading={isLoading}
          canSwap={canSwap}
          quote={quote || null}
          isLoadingQuote={isLoadingQuote}
          fromToken={fromToken}
          toToken={toToken}
          fromAmount={fromAmount}
          network={network}
          setFromToken={setFromToken}
          setToToken={setToToken}
          setFromAmount={setFromAmount}
          swapTokens={swapTokens}
        />

        {lastTxHash && (
          <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
            <p className="text-sm text-green-800 dark:text-green-200">
              Swap completed! Transaction: {lastTxHash.slice(0, 10)}...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
