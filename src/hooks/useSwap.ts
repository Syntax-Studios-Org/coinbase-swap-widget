import { useState, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { SwapService } from "@/services/swap.service";
import type { SwapParams, Token } from "@/types/swap";

export const useSwapPrice = (
  fromToken: Token | null,
  toToken: Token | null,
  fromAmount: bigint,
  network: string,
  enabled: boolean = true,
) => {
  const evmAddress = useEvmAddress();

  return useQuery({
    queryKey: [
      "swapPrice",
      fromToken?.address,
      toToken?.address,
      fromAmount.toString(),
      network,
    ],
    queryFn: async () => {
      console.log("useSwapPrice queryFn executing...");

      if (!fromToken || !toToken || !evmAddress || fromAmount === BigInt(0)) {
        console.log(
          "useSwapPrice queryFn: Missing required data, returning null",
        );
        return null;
      }

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
      return quote;
    },
    enabled: (() => {
      const isEnabled =
        enabled &&
        !!fromToken &&
        !!toToken &&
        !!evmAddress &&
        fromAmount > BigInt(0);
      return isEnabled;
    })(),
    refetchInterval: 10000, // Refetch every 10 seconds for fresh prices
    staleTime: 5000, // Consider data stale after 5 seconds
  });
};

export const useCreateSwapQuote = () => {
  const evmAddress = useEvmAddress();

  return useMutation({
    mutationFn: async (params: SwapParams & { slippageBps?: number }) => {
      if (!evmAddress) {
        throw new Error("No wallet address available");
      }

      const result = await SwapService.createSwapQuote({
        ...params,
        taker: evmAddress,
      });
      return result;
    },
    onError: (error) => {
      console.error("Failed to create swap quote:", error);
    },
  });
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
