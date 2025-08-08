import { useState, useCallback, useEffect } from "react";
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { SwapService } from "@/services/swap.service";
import { SWAP_CONFIG } from "@/constants/config";
import { performanceTracker, PERF_OPERATIONS } from "@/utils/performance";
import type {
  SwapParams,
  Token,
  SwapQuote,
  SwapQuoteResponse,
} from "@/types/swap";

export const useSwapPrice = (
  fromToken: Token | null,
  toToken: Token | null,
  fromAmount: bigint,
  network: string,
  enabled: boolean = true,
) => {
  const evmAddress = useEvmAddress();
  const [data, setData] = useState<SwapQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrice = useCallback(async () => {
    if (
      !enabled ||
      !fromToken ||
      !toToken ||
      !evmAddress ||
      fromAmount === BigInt(0)
    ) {
      setData(null);
      return;
    }

    const operationId = `${PERF_OPERATIONS.QUOTE_FETCH}-${Date.now()}`;
    performanceTracker.startTiming(operationId, {
      fromToken: fromToken.symbol,
      toToken: toToken.symbol,
      network,
      fromAmount: fromAmount.toString(),
    });

    setIsLoading(true);
    setError(null);

    try {
      const params: SwapParams = {
        fromToken: fromToken.address,
        toToken: toToken.address,
        fromAmount,
        network,
        taker: evmAddress,
      };

      const quote = await SwapService.getSwapPrice(params);
      if (quote) {
        quote.fromToken = fromToken;
        quote.toToken = toToken;
      }
      setData(quote);
      performanceTracker.endTiming(operationId, { success: true, hasQuote: !!quote });
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch price"));
      setData(null);
      performanceTracker.endTiming(operationId, { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      });
    } finally {
      setIsLoading(false);
    }
  }, [enabled, fromToken?.address, toToken?.address, evmAddress, fromAmount, network]);

  useEffect(() => {
    fetchPrice();

    // Auto-refresh for fresh prices
    const interval = setInterval(fetchPrice, SWAP_CONFIG.PRICE_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchPrice]);

  return { data, isLoading, error, refetch: fetchPrice };
};

export const useCreateSwapQuote = () => {
  const evmAddress = useEvmAddress();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createQuote = useCallback(
    async (
      params: SwapParams & { slippageBps?: number },
    ): Promise<SwapQuoteResponse> => {
      if (!evmAddress) {
        throw new Error("No wallet address available");
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await SwapService.createSwapQuote({
          ...params,
          taker: evmAddress,
        });
        return result;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to create swap quote");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [evmAddress],
  );

  return { createQuote, isLoading, error };
};

export const useSwapState = () => {
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState<string>("");
  const [network, setNetwork] = useState<string>("base");

  const swapTokens = useCallback(() => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(""); // Clear amount when swapping
  }, [fromToken, toToken]);

  const resetSwap = useCallback(() => {
    setFromToken(null);
    setToToken(null);
    setFromAmount("");
  }, []);

  return {
    fromToken,
    toToken,
    fromAmount,
    network,
    setFromToken,
    setToToken,
    setFromAmount,
    setNetwork,
    swapTokens,
    resetSwap,
  };
};
