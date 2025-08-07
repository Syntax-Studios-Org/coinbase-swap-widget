"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui";
import type { Token, SwapQuote } from "@/types/swap";
import { formatUnits } from "viem";
import { getTokenDecimals, getTokenSymbol } from "@/utils/tokens";
import Image from "next/image";
import { NETWORKS } from "@/constants/config";

interface ReviewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<any>;
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  quote: SwapQuote;
  slippage: number;
  isLoading: boolean;
  network: string;
}

type TransactionState = "review" | "submitted" | "success" | "failed";

export function ReviewTransactionModal({
  isOpen,
  onClose,
  onConfirm,
  fromToken,
  toToken,
  fromAmount,
  quote,
  slippage,
  isLoading,
  network,
}: ReviewTransactionModalProps) {
  const [txState, setTxState] = useState<TransactionState>("review");
  const [txHash, setTxHash] = useState<string>("");

  const toAmount = quote
    ? (
        parseFloat(quote.toAmount.toString()) / Math.pow(10, toToken.decimals)
      ).toFixed(6)
    : "0";

  const handleConfirm = async () => {
    try {
      setTxState("submitted");
      const result = await onConfirm();
      setTxHash(result?.transactionHash || "");
      setTxState("success");
    } catch (error) {
      setTxState("failed");
    }
  };

  const handleRetry = () => {
    setTxState("review");
  };

  const handleClose = () => {
    // Only allow closing if not in submitted state
    if (txState !== 'submitted') {
      setTxState('review');
      setTxHash('');
      onClose();
    }
  };

  const getExplorerUrl = (hash: string) => {
    // Find the network
    const currentNetwork = Object.entries(NETWORKS).find(([key, value]) => key.toLowerCase() === network.toLowerCase());
    if (!currentNetwork) return '';

    // Get the explorer URL
    return `${currentNetwork[1].explorerUrl}/tx/${hash}`;
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // Prevent closing during submitted state, allow manual close in other states
        if (!open && txState !== 'submitted') {
          handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[400px] bg-[#141519]">
        <DialogHeader>
          <DialogTitle className="text-white text-left font-normal font-coinbase-sans -mt-2">
            Review transaction
          </DialogTitle>
        </DialogHeader>

        <div>
          {/* Token Icons - Always visible */}
          <div className="flex items-center justify-center space-x-0.5 mb-4 mt-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10">
              {fromToken.logoUrl ? (
                <Image
                  src={fromToken.logoUrl}
                  alt={fromToken.symbol}
                  className="rounded-full"
                  width={32}
                  height={32}
                />
              ) : (
                <span className="text-white font-medium">
                  {fromToken.symbol.charAt(0)}
                </span>
              )}
            </div>
            <div className="text-white/60">→</div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10">
              {toToken.logoUrl ? (
                <Image
                  src={toToken.logoUrl}
                  alt={toToken.symbol}
                  className="rounded-full"
                  width={32}
                  height={32}
                />
              ) : (
                <span className="text-white font-medium">
                  {toToken.symbol.charAt(0)}
                </span>
              )}
            </div>
          </div>

          {/* Swap Details - Always visible */}
          <div className="text-center mb-4">
            <p className="text-white text-lg">You're swapping</p>
            <p className="text-white text-xl font-medium">
              {fromAmount} {fromToken.symbol} → {toAmount} {toToken.symbol}
            </p>
            <p className="text-white/60 text-sm mt-2">
              Transfer usually takes &lt;30s
            </p>
          </div>

          {/* Separator - Always visible */}
          <div className="relative my-6 -mx-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#141519] px-3 py-1 text-xs text-white/50 border border-white/10 rounded-full flex items-center">
                <span><Image src={'/lock.svg'} width={16} height={16} alt='lock' /></span> SECURED BY coinbase
              </span>
            </div>
          </div>

          {txState === "review" && (
            <>
              {/* Trade Details */}
              <div className="bg-[#1A1B1F] rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium">Trade details</h3>
                  <div className="text-white/60">⌄</div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-white/60">
                    <span>Slippage tolerance</span>
                    <span>{slippage}%</span>
                  </div>
                  {quote.fees?.protocolFee && (
                    <div className="flex justify-between text-white/60">
                      <div className="flex items-center gap-1">
                        <span>Transaction fee</span>
                      </div>
                      <span className="text-blue-400">
                        {formatUnits(
                          BigInt(quote.fees?.protocolFee.amount || "0"),
                          getTokenDecimals(
                            quote.fees.protocolFee.token,
                            network,
                          ),
                        )} {getTokenSymbol(quote.fees?.protocolFee.token, network)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Confirm Button */}
              <Button
                onClick={handleConfirm}
                disabled={isLoading}
                isLoading={isLoading}
                className="w-full h-12 bg-white hover:bg-white/90 text-black font-medium rounded-full"
              >
                Confirm swap
              </Button>
            </>
          )}

          {txState === "submitted" && (
            <>
              {/* Transaction Status */}
              <div className="bg-[#1A1B1F] rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium mb-1">
                      Transaction submitted
                    </h3>
                    <p className="text-white/60 text-sm">
                      Your swap is being processed
                    </p>
                  </div>
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                </div>
              </div>
            </>
          )}

          {txState === "success" && (
            <>
              {/* Success Status */}
              <div className="bg-[#1B2422] rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium mb-1">
                      Transaction Completed
                    </h3>
                    <p className="text-white/60 text-sm">
                      Your swap has been completed
                    </p>
                  </div>
                  <div><Image src="/check-tick-double.svg" alt="Success" width={24} height={24} /></div>
                </div>
              </div>

              {/* View on Explorer Button */}
              <Button
                onClick={() =>
                  txHash && window.open(getExplorerUrl(txHash), "_blank")
                }
                className="w-full h-12 bg-white hover:bg-white/90 text-black font-normal rounded-full mb-3 text-sm"
              >
                View on explorer
              </Button>

              {/* Close Button */}
              <Button
                onClick={handleClose}
                className="w-full h-12 bg-transparent hover:bg-white/5 text-white font-medium rounded-full border border-white/20"
              >
                Close
              </Button>
            </>
          )}

          {txState === "failed" && (
            <>
              {/* Failed Status */}
              <div className="bg-[#281E21] rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[#DF6A70] font-normal text-sm mb-1">
                      Transaction failed. Make sure you have enough to cover
                      gas.
                    </h3>
                  </div>
                  <div className="w-6 h-6 text-[#DF6A70]">⚠</div>
                </div>
              </div>

              {/* Retry Button */}
              <Button
                onClick={handleRetry}
                className="w-full h-12 bg-white hover:bg-white/90 text-black font-medium rounded-full tracking-tight"
              >
                Retry
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
