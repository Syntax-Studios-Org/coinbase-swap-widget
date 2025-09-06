import { useState, useCallback } from "react";
import { useEvmAddress, useSendEvmTransaction } from "@coinbase/cdp-hooks";
import { encodeFunctionData, erc20Abi, parseUnits, isAddress } from "viem";
import {
  createBasePublicClient,
  waitForTransactionConfirmation,
} from "@/lib/transaction-helper";
import type { Token } from "@/types/swap";

interface SendParams {
  token: Token;
  amount: string;
  toAddress: string;
  network: string;
}

interface SendExecutionResult {
  transactionHash: string;
}

const getChainId = (network: string): number => {
  switch (network.toLowerCase()) {
    case "base":
      return 8453;
    case "mainnet":
      return 1;
    default:
      return 8453;
  }
};

/**
 * useSend hook that handles token sending functionality:
 * - State management for send form
 * - Address validation
 * - Send execution
 */
export const useSend = () => {
  const evmAddress = useEvmAddress();
  const sendTransaction = useSendEvmTransaction();
  const publicClient = createBasePublicClient();

  // State management
  const [token, setToken] = useState<Token | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [toAddress, setToAddress] = useState<string>("");
  const [network, setNetwork] = useState<string>("base");

  // Execution state
  const [isExecutionLoading, setIsExecutionLoading] = useState(false);
  const [executionError, setExecutionError] = useState<Error | null>(null);

  // Validation functions
  const isValidAddress = useCallback((address: string): boolean => {
    return isAddress(address);
  }, []);

  const isValidAmount = useCallback((amountStr: string): boolean => {
    return (
      amountStr !== "" && !isNaN(Number(amountStr)) && Number(amountStr) > 0
    );
  }, []);

  // State management functions
  const resetSend = useCallback(() => {
    setToken(null);
    setAmount("");
    setToAddress("");
  }, []);

  // Send execution functionality
  const executeSend = useCallback(
    async ({
      token: sendToken,
      amount: sendAmount,
      toAddress: recipient,
      network: networkParam,
    }: SendParams): Promise<SendExecutionResult> => {
      if (!evmAddress) {
        throw new Error("Wallet not connected");
      }

      if (!isValidAddress(recipient)) {
        throw new Error("Invalid recipient address");
      }

      if (!isValidAmount(sendAmount)) {
        throw new Error("Invalid amount");
      }

      setIsExecutionLoading(true);
      setExecutionError(null);

      try {
        // Convert amount to BigInt with proper decimals
        const amountBigInt = parseUnits(sendAmount, sendToken.decimals);

        // Check if it's ETH/native token or ERC-20
        const isNativeToken =
          sendToken.address.toLowerCase() ===
          "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

        let txData: `0x${string}`;
        let txTo: `0x${string}`;
        let txValue: bigint;

        if (isNativeToken) {
          // Native token transfer (ETH)
          txTo = recipient as `0x${string}`;
          txData = "0x";
          txValue = amountBigInt;
        } else {
          // ERC-20 token transfer
          txTo = sendToken.address as `0x${string}`;
          txData = encodeFunctionData({
            abi: erc20Abi,
            functionName: "transfer",
            args: [recipient as `0x${string}`, amountBigInt],
          });
          txValue = 0n;
        }

        // Estimate gas
        let estimatedGas: bigint;
        try {
          estimatedGas = await publicClient.estimateGas({
            account: evmAddress as `0x${string}`,
            to: txTo,
            data: txData,
            value: txValue,
          });
          // Add 20% buffer to the estimated gas
          estimatedGas = (estimatedGas * 120n) / 100n;
        } catch (error) {
          console.warn("Gas estimation failed, using fallback:", error);
          estimatedGas = isNativeToken ? 21000n : 100000n; // Fallback gas limits
        }

        // Get current gas prices from the network
        let maxFeePerGas: bigint;
        let maxPriorityFeePerGas: bigint;
        try {
          const feeData = await publicClient.estimateFeesPerGas();
          maxFeePerGas = feeData.maxFeePerGas || 10000000n;
          maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || 1000000n;
        } catch (error) {
          console.warn("Fee estimation failed, using fallback:", error);
          maxFeePerGas = 10000000n;
          maxPriorityFeePerGas = 1000000n;
        }

        console.log("Executing send...");
        const sendTx = await sendTransaction({
          evmAccount: evmAddress,
          network: networkParam as any,
          transaction: {
            to: txTo,
            data: txData,
            value: txValue,
            gas: estimatedGas,
            maxFeePerGas,
            maxPriorityFeePerGas,
            chainId: getChainId(networkParam),
            type: "eip1559" as const,
          },
        });

        await waitForTransactionConfirmation(
          publicClient,
          sendTx.transactionHash,
          "Send transaction",
        );

        const result = { transactionHash: sendTx.transactionHash };
        console.log("Send completed successfully:", result.transactionHash);
        return result;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Send execution failed");
        setExecutionError(error);
        console.error("Send failed:", error);
        throw error;
      } finally {
        setIsExecutionLoading(false);
      }
    },
    [evmAddress, sendTransaction, publicClient, isValidAddress, isValidAmount],
  );

  return {
    // State
    token,
    amount,
    toAddress,
    network,
    setToken,
    setAmount,
    setToAddress,
    setNetwork,
    resetSend,

    // Validation
    isValidAddress,
    isValidAmount,

    // Execution
    executeSend,
    isExecutionLoading,
    executionError,
  };
};
