import { useState, useCallback } from "react";
import {
  useEvmAddress,
  useSendEvmTransaction,
  useSignEvmTypedData,
} from "@coinbase/cdp-hooks";
import {
  concat,
  numberToHex,
  size,
  type Hex,
  encodeFunctionData,
  erc20Abi,
} from "viem";
import type {
  SwapQuoteResponse,
  AllowanceIssue,
  Permit2Data,
} from "@/types/swap";
import {
  createBasePublicClient,
  waitForTransactionConfirmation,
} from "@/lib/transaction-helper";

interface SwapExecutionParams {
  swapQuote: SwapQuoteResponse;
  fromTokenAddress: string;
  network: string;
}

const getChainId = (network: string): number => {
  switch (network.toLowerCase()) {
    case "base":
      return 8453;
    default:
      return 8453;
  }
};

export const useSwapExecution = () => {
  const evmAddress = useEvmAddress();
  const sendTransaction = useSendEvmTransaction();
  const signTypedData = useSignEvmTypedData();
  const publicClient = createBasePublicClient();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleTokenApproval = useCallback(async (
    allowanceIssue: AllowanceIssue,
    fromTokenAddress: string,
    network: string,
    requiredAllowance: bigint,
  ) => {
    const currentAllowance = BigInt(allowanceIssue.currentAllowance);
    const spender = allowanceIssue.spender;

    if (currentAllowance >= requiredAllowance) return;

    console.log(
      "Sending ERC-20 approval for",
      requiredAllowance.toString(),
      "tokens...",
    );

    const approveData = encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [spender as `0x${string}`, requiredAllowance],
    });

    // Simulate the transaction to estimate gas
    let estimatedGas: bigint;
    try {
      estimatedGas = await publicClient.estimateGas({
        account: evmAddress as `0x${string}`,
        to: fromTokenAddress as `0x${string}`,
        data: approveData,
        value: 0n,
      });
      // Add 20% buffer to the estimated gas
      estimatedGas = (estimatedGas * 120n) / 100n;
    } catch (error) {
      console.warn("Gas estimation failed, using fallback:", error);
      estimatedGas = 100000n; // Fallback gas limit
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

    const approvalTx = await sendTransaction({
      evmAccount: evmAddress!,
      network: network as any,
      transaction: {
        to: fromTokenAddress as `0x${string}`,
        data: approveData,
        value: 0n,
        gas: estimatedGas,
        maxFeePerGas,
        maxPriorityFeePerGas,
        chainId: getChainId(network),
        type: "eip1559" as const,
      },
    });

    await waitForTransactionConfirmation(
      publicClient,
      approvalTx.transactionHash,
      "ERC-20 approval",
    );
  }, [evmAddress, sendTransaction, publicClient]);

  const signPermit2Message = useCallback(async (permit2Data: Permit2Data): Promise<Hex> => {
    console.log("Signing Permit2 message...");

    const signResult = await signTypedData({
      evmAccount: evmAddress!,
      typedData: {
        domain: permit2Data.eip712.domain,
        types: permit2Data.eip712.types,
        primaryType: permit2Data.eip712.primaryType,
        message: permit2Data.eip712.message,
      },
    });

    const signature = signResult.signature as Hex;
    const signatureLength = numberToHex(size(signature), {
      signed: false,
      size: 32,
    });

    return concat([signatureLength, signature]);
  }, [evmAddress, signTypedData]);

  const executeSwap = useCallback(async ({
    swapQuote,
    fromTokenAddress,
    network,
  }: SwapExecutionParams): Promise<{ transactionHash: string }> => {
    if (!evmAddress) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    setError(null);

    try {
      if (swapQuote.issues?.allowance) {
        await handleTokenApproval(
          swapQuote.issues.allowance,
          fromTokenAddress,
          network,
          BigInt(swapQuote.fromAmount),
        );
      }

      let txData = swapQuote.transaction.data as Hex;
      if (swapQuote.permit2?.eip712) {
        const permitSignature = await signPermit2Message(swapQuote.permit2);
        txData = concat([txData, permitSignature]);
      }

      console.log("Executing swap...");
      const swapTx = await sendTransaction({
        evmAccount: evmAddress,
        network: network as any,
        transaction: {
          to: swapQuote.transaction.to as `0x${string}`,
          data: txData,
          value: BigInt(swapQuote.transaction.value),
          gas: swapQuote.transaction.gas
            ? BigInt(swapQuote.transaction.gas)
            : 500000n,
          maxFeePerGas: swapQuote.transaction.gasPrice
            ? BigInt(swapQuote.transaction.gasPrice)
            : 10000000n,
          maxPriorityFeePerGas: swapQuote.transaction.gasPrice
            ? BigInt(
                Math.min(
                  Math.floor(Number(swapQuote.transaction.gasPrice) * 0.1),
                  1000000000,
                ),
              )
            : 1000000000n,
          chainId: getChainId(network),
          type: "eip1559" as const,
        },
      });

      await waitForTransactionConfirmation(
        publicClient,
        swapTx.transactionHash,
        "Swap transaction",
      );

      const result = { transactionHash: swapTx.transactionHash };
      console.log("Swap completed successfully:", result.transactionHash);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Swap execution failed');
      setError(error);
      console.error("Swap failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [evmAddress, sendTransaction, signTypedData, publicClient, handleTokenApproval, signPermit2Message]);

  return { executeSwap, isLoading, error };
};
