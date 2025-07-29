import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { OnrampService } from "@/services/onramp.service";
import { ONRAMP_CONFIG } from "@/constants/config";
import type {
  GenerateOnrampUrlRequest,
  OnrampState,
  UseOnrampReturn,
  SupportedFiatCurrency,
  SupportedOnrampAsset,
  SupportedOnrampNetwork,
  PaymentMethod
} from "@/types/onramp";
import type { Address } from "viem";

export const useOnramp = (): UseOnrampReturn => {
  const evmAddress = useEvmAddress();

  const [state, setState] = useState<OnrampState>({
    isLoading: false,
    error: null,
    sessionToken: null,
    onrampUrl: null,
    isGeneratingUrl: false,
  });

  const generateUrlMutation = useMutation({
    mutationFn: async (params: GenerateOnrampUrlRequest) => {
      if (!evmAddress) {
        throw new Error("Wallet address not available");
      }

      // Validate parameters
      const isValid = OnrampService.validateOnrampParams({
        fiatAmount: params.fiatAmount,
        fiatCurrency: params.fiatCurrency,
        cryptoAsset: params.cryptoAsset,
        network: params.network,
        destinationAddress: evmAddress,
      });

      if (!isValid) {
        throw new Error("Invalid onramp parameters");
      }

      // Generate USDC onramp URL
      const url = await OnrampService.generateUSDCOnrampUrl(
        evmAddress,
        params.fiatAmount,
        params.fiatCurrency
      );

      if (!url) {
        throw new Error("Failed to generate onramp URL");
      }

      return url;
    },
    onMutate: () => {
      setState(prev => ({
        ...prev,
        isGeneratingUrl: true,
        error: null,
      }));
    },
    onSuccess: (url) => {
      setState(prev => ({
        ...prev,
        onrampUrl: url,
        isGeneratingUrl: false,
        error: null,
      }));
    },
    onError: (error: Error) => {
      setState(prev => ({
        ...prev,
        isGeneratingUrl: false,
        error: error.message,
        onrampUrl: null,
      }));
    },
  });

  const generateOnrampUrl = useCallback(
    async (params: GenerateOnrampUrlRequest): Promise<string | null> => {
      try {
        const url = await generateUrlMutation.mutateAsync(params);
        return url;
      } catch (error) {
        console.error("Failed to generate onramp URL:", error);
        return null;
      }
    },
    [generateUrlMutation]
  );

  const openOnramp = useCallback(
    async (params: GenerateOnrampUrlRequest): Promise<void> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const url = await generateOnrampUrl(params);

        if (!url) {
          throw new Error("Failed to generate onramp URL");
        }

        // Open the onramp URL
        OnrampService.openOnrampWindow(url);

        setState(prev => ({ ...prev, isLoading: false }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : "Unknown error occurred",
        }));
      }
    },
    [generateOnrampUrl]
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      sessionToken: null,
      onrampUrl: null,
      isGeneratingUrl: false,
    });
  }, []);

  return {
    generateOnrampUrl,
    openOnramp,
    state: {
      ...state,
      isLoading: state.isLoading || generateUrlMutation.isPending,
    },
    reset,
  };
};

// Simplified hook for USDC onramp specifically
export const useUSDCOnramp = () => {
  const onramp = useOnramp();

  const openUSDCOnramp = useCallback(
    async (fiatAmount: number, fiatCurrency: SupportedFiatCurrency = "USD") => {
      await onramp.openOnramp({
        destinationAddress: "0x" as Address, // This will be replaced by the actual address in the hook
        fiatAmount,
        fiatCurrency,
        cryptoAsset: "USDC" as SupportedOnrampAsset,
        network: "base" as SupportedOnrampNetwork,
        paymentMethod: ONRAMP_CONFIG.defaultPaymentMethod as PaymentMethod,
      });
    },
    [onramp]
  );

  return {
    openUSDCOnramp,
    ...onramp,
  };
};
